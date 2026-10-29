/**
 * Valiant Aircraft
 *
 * Provides a Valiant aircraft that can be added and updated in the game world.
 */

import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { brightenMaterial, proceduralMetalMaterial } from '@/scenograph/materials.js';
import ValiantObject from '#/game/src/objects/aircraft/valiant';

export default class Valiant {

    // Camera distance.
    camera_distance;

    // Default camera distance.
    default_camera_distance;

    // Ship Model (gltf)
    model;

    // The ship mesh.
    mesh;

    // Animation mixer.
    mixer;

    // Aircraft ready for input (intro sequence finished)
    ready;

    // Aircraft flight sim data like airspeed.
    state;

    // Object containing elements that drive the ships thruster.
    thruster;

    // TrailRenderer effect showing a trailing effect on the thruster.
    trail;

    // Short flame trail used at cruise speeds.
    cruiseTrail;

    constructor( isDemo = false ) {
        this.default_camera_distance = -35;
        this.trail_position_y = 1.2;
        this.trail_position_z = 1.5;
        this.camera_distance = 0;
        this.chaseLookAhead = 12;
        this._chaseLookAt = new THREE.Vector3();
        this.overdriveBlend = 0;
        this.trailAnchor = new THREE.Vector3();

        this.ready = false;

        this.demo = isDemo;

    }

    // Loads the ship model inc built-in animations
    async load() {


        this.model = await l.current_scene.loaders.gtlf.loadAsync( '/assets/models/mercenary4.glb' );

        let amount = l.config.settings.fast ? 5 : 2.5;

        this.model.scene.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;

                child.original_material = child.material.clone();

                let scale = 0.7;

                if ( child.name == 'Chassis' ) {
                    scale = 1.05;
                }

                if ( child.name != 'Fuselage' ) {

                    child.material = proceduralMetalMaterial( {
                        uniforms: {
                            scale         :  { value: scale },                                           // Scale
                            lacunarity    :  { value: 2.0 },                                             // Lacunarity
                            randomness    :  { value: 1.0 },                                             // Randomness
                            diffuseColour1:  { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.40 ) },     // Diffuse gradient colour 1
                            diffuseColour2:  { value: new THREE.Vector4( 0.5, 0.5, 0.5, 0.43 ) },        // Diffuse gradient colour 2
                            diffuseColour3:  { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.44 ) },     // Diffuse gradient colour 3
                            emitColour1   :  { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.61 ) },     // Emission gradient colour 1
                            emitColour2   :  { value: new THREE.Vector4( 0.8, 0.0, 1.0, 0.63 ) },        // Emission gradient colour 2
                        }
                    } );

                }
                else {
                    brightenMaterial( child.material, amount );
                }

            }

        } );

        this.mesh = this.model.scene;
        this.mesh.position.z = l.current_scene.room_depth;
        this.mesh.rotation.order = 'YXZ';
        this.mesh.scale.setScalar(2);

        this.mesh.userData.targetable = true;

        this.createThruster();

        this.mixer = new THREE.AnimationMixer( this.mesh );
        this.mixer.clipAction( this.model.animations[ 0 ] ).play();
        this.mixer.clipAction( this.model.animations[ 1 ] ).play();

        //l.current_scene.effects.particles.createShipThruster(this, 1.5, { x: 0, y: 1.2, z: 1.5 });

        // Short flame for cruise speeds.
        this.cruiseTrail = l.current_scene.effects.trail.createTrail(
            this.mesh, 0, this.trail_position_y, this.trail_position_z,
            { trailLength: 2, advanceFrequency: 30, headScale: 0.25, nameSuffix: ' Cruise Trail' }
        );
        this.cruiseTrail.mesh.visible = false;
        this.cruiseTrail.mesh.material.uniforms.headColor.value.w = 0;
        this.cruiseTrail.mesh.material.uniforms.tailColor.value.w = 0;

        // Longer soft cylinder plume for overdrive.
        this.trail = l.current_scene.effects.trail.createTrail(
            this.mesh, 0, this.trail_position_y, this.trail_position_z,
            { trailLength: 16, advanceFrequency: 48, headScale: 0.2, nameSuffix: ' Overdrive Trail' }
        );
        this.trail.mesh.visible = false;
        this.trail.mesh.material.uniforms.headColor.value.w = 0;
        this.trail.mesh.material.uniforms.tailColor.value.w = 0;

        this.mesh.userData.object = new ValiantObject( this.mesh );
    }

    createThrusterMesh( options ) {
        let geometry = false,
            texture = false,
            material = false,
            mesh = false;

        switch ( options.geometry ) {
            case 'cone':
                geometry = new THREE.ConeGeometry(
                    options.radius,
                    options.height,
                    options.radialSegments,
                );
                break;

            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    options.radius, // radiusTop
                    options.radius, // radiusBottom
                    options.height,
                    options.radialSegments,
                );
                geometry.openEnded = true;
                break;
        }

        texture = new THREE.VideoTexture( this.thruster.videoElement );
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, options.texture_repeat );
        texture.rotation = - Math.PI / 2;

        const parameters = {
            depthWrite: false,
            map: texture,
            transparent: true,
        };

        material = new THREE.MeshBasicMaterial( parameters );

        material.blending = THREE.CustomBlending;
        material.blendSrc = THREE.SrcAlphaFactor;
        material.blendDst = THREE.OneFactor;
        material.blendEquation = THREE.AddEquation;

        // Nest material in an array so it only paints the first face of the cylinder.
        if ( options.geometry == 'cylinder' ) {
            material = [
                material,
                new THREE.MeshBasicMaterial( { visible: false } ),
                new THREE.MeshBasicMaterial( { visible: false } )
            ];
        }

        mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }

    // Uses a video texture to create a jet engine afterburner effect
    createThruster() {
        this.thruster = {
            container: new THREE.Object3D(),
            containerPosition: {
                x: 0,
                y: 1.2,
                z: 1.5
            },
            rearConeBurner: false,
            centralConeBurner: false,
            innerCylBurner: false,
            outerCylBurner: false,
            videoElement: false,
        };

        // Setup the thruster container which will contain the other meshes.
        this.thruster.container.rotation.x = Math.PI / 2;
        this.thruster.container.position.set(
            this.thruster.containerPosition.x,
            this.thruster.containerPosition.y,
            this.thruster.containerPosition.z,
        );

        // Instantiate the video element for reuse
        this.thruster.videoElement = document.getElementById( 'thruster' );
        this.thruster.videoElement.play();
        this.thruster.videoElement.playbackRate = 0.25;

        // Setup rear cone burner.
        this.thruster.rearConeBurner = this.createThrusterMesh( {
            geometry: 'cone',
            radius: 0.3,
            height: 0.6,
            radialSegments: 8,
            texture_repeat: 8,
        } );
        this.thruster.rearConeBurner.position.z = - 0.05;
        this.thruster.container.add( this.thruster.rearConeBurner );

        // Setup central cone burner.
        this.thruster.centralConeBurner = this.createThrusterMesh( {
            geometry: 'cone',
            radius: 0.3,
            height: 2,
            radialSegments: 8,
            texture_repeat: 8,
        } );
        this.thruster.centralConeBurner.rotation.y = Math.PI / 4;
        this.thruster.container.add( this.thruster.centralConeBurner );

        // Setup the inner cylinder burner
        this.thruster.innerCylBurner = this.createThrusterMesh( {
            geometry: 'cylinder',
            radius: 0.15,
            height: 0.75,
            radialSegments: 16,
            texture_repeat: 4,
        } );
        this.thruster.container.add( this.thruster.innerCylBurner );

        // Setup the outer cylinder burner
        this.thruster.outerCylBurner = this.createThrusterMesh( {
            geometry: 'cylinder',
            radius: 0.25,
            height: 0.75,
            radialSegments: 16,
            texture_repeat: 8,
        } );
        this.thruster.outerCylBurner.rotation.y = Math.PI / 4;
        this.thruster.container.add( this.thruster.outerCylBurner );

        // Add the thruster container to the mesh.
        this.mesh.add( this.thruster.container );
    }

    updateAnimation( delta ) {
        if ( this.mixer ) {
            this.mixer.update( delta );
        }

        // Rock the ship forward and back when moving horizontally
        if ( this.mesh.userData.object.controls.throttleDown || this.mesh.userData.object.controls.throttleUp ) {
            let pitchChange = this.mesh.userData.object.controls.throttleUp ? -1 : 1;
            if ( Math.abs( this.mesh.rotation.x ) < 1 / 4 ) {
                this.mesh.rotation.x += pitchChange / 10 / 180;
            }
        }

        // Rock the ship forward and back when moving vertically
        if (
            this.mesh.userData.object.controls.moveDown
            ||
            this.mesh.userData.object.controls.moveUp
        ) {
            let elevationChange = this.mesh.userData.object.controls.moveDown ? -1 : 1;
            if ( Math.abs( this.mesh.rotation.x ) < 1 / 8 ) {
                this.mesh.rotation.x += elevationChange / 10 / 180;
            }
        }
    }

    chaseCameraDistance() {
        let distance = this.default_camera_distance + ( l.current_scene.room_depth / 2 );
        if ( this.mesh.userData.object && this.mesh.userData.object.airSpeed < 0 ) {
            distance -= this.mesh.userData.object.airSpeed * 4;
        }
        return distance;
    }

    getChaseCameraPosition( yaw = this.mesh.rotation.y ) {
        const ship = this.mesh;
        const distance = this.chaseCameraDistance();
        return {
            x: ship.position.x + distance * Math.sin( yaw ),
            y: ship.position.y + ( l.scenograph.cameras.playerY - 8.5 ),
            z: ship.position.z + distance * Math.cos( yaw )
        };
    }

    aimChaseCamera() {
        const ship = this.mesh;
        const heading = ship.rotation.y;
        this._chaseLookAt.set(
            ship.position.x - Math.sin( heading ) * this.chaseLookAhead,
            ship.position.y + 1.2,
            ship.position.z - Math.cos( heading ) * this.chaseLookAhead
        );
        l.scenograph.cameras.player.lookAt( this._chaseLookAt );
    }

    applyChaseCamera( yaw = this.mesh.rotation.y ) {
        const pos = this.getChaseCameraPosition( yaw );
        l.scenograph.cameras.player.position.set( pos.x, pos.y, pos.z );
        this.aimChaseCamera();
        l.scenograph.cameras.player.updateProjectionMatrix();
    }

    // Update the position of the aircraft to spot determined by game logic.
    updateMesh() {
        this.mesh.position.x = this.mesh.userData.object.position.x;
        this.mesh.position.y = this.mesh.userData.object.position.y;
        this.mesh.position.z = this.mesh.userData.object.position.z;
        this.mesh.rotation.x = this.mesh.userData.object.rotation.x;
        this.mesh.rotation.y = this.mesh.userData.object.rotation.y;
        this.mesh.rotation.z = this.mesh.userData.object.rotation.z;
    }

    /**
     * Animate hook.
     *
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     *
     * @method animate
     * @memberof Valiant
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate( delta ) {

        const departing = l.mode === 'hangar' && l.scenograph.hangar && l.scenograph.hangar.departing;
        if ( departing || ( l.current_scene.objects.demoTour.ready && l.mode != 'hangar' ) ) {
            this.updateAnimation( delta );
            if ( ! this.demo && l.mode != 'hangar' ) {
                this.animateTrail();
            }
        }
    }

    animateTrail() {
        if ( ! this.trail || ! this.cruiseTrail ) {
            return;
        }

        let object = this.mesh.userData.object,
            thrusting = object.airSpeed < 0,
            speed = Math.abs( object.airSpeed ),
            // Crossfade short flame → cylinder between 380–420 km/h (HUD @ 60 FPS).
            fadeIn = 380 / 60,
            fadeOut = 420 / 60,
            cruiseCap = object.cruiseForward || ( 400 / 60 ),
            // Keeps overdrive plume length near the earlier soft-cylinder look.
            nodeSpacing = ( 35 / 60 ) * ( 60 / 48 ),
            blendTarget = 0,
            cruiseWeight = 0,
            overdriveWeight = 0,
            turbulence = 0,
            jitter = 0,
            traveled = 0,
            steps = 0,
            i = 0;

        if ( speed >= fadeOut ) {
            blendTarget = 1;
        }
        else if ( speed > fadeIn ) {
            blendTarget = ( speed - fadeIn ) / ( fadeOut - fadeIn );
        }

        this.overdriveBlend += ( blendTarget - this.overdriveBlend ) * 0.15;
        if ( Math.abs( this.overdriveBlend - blendTarget ) < 0.002 ) {
            this.overdriveBlend = blendTarget;
        }

        cruiseWeight = 1 - this.overdriveBlend;
        overdriveWeight = this.overdriveBlend;

        // Turbulence only after cruise; gentle at first, then ramps toward maxForward.
        if ( speed > cruiseCap ) {
            turbulence = Math.min( 1, ( speed - cruiseCap ) / Math.max( 0.001, object.maxForward - cruiseCap ) );
        }
        jitter = turbulence * turbulence * 0.045;

        if ( thrusting ) {
            // Cones keep cruise scale; cylinders open with overdrive.
            this.animateThruster( object.airSpeed, this.thruster.centralConeBurner, .5, 0 );
            this.animateThruster( object.airSpeed, this.thruster.outerCylBurner, .5, this.overdriveBlend );
            this.thruster.innerCylBurner.scale.y = 1 + this.overdriveBlend * 1.4;
            this.thruster.innerCylBurner.position.y = this.overdriveBlend * 0.55;

            this.spinThruster( object.airSpeed, this.thruster.rearConeBurner, -1 );
            this.spinThruster( object.airSpeed, this.thruster.centralConeBurner, 1 );
            this.spinThruster( object.airSpeed, this.thruster.outerCylBurner, -1 );
            this.spinThruster( object.airSpeed, this.thruster.innerCylBurner, 1 );

            this.thruster.videoElement.playbackRate = Math.min( 5, 0.25 + speed + this.overdriveBlend * 2.0 );

            this.mesh.updateMatrixWorld( true );

            // Short cruise flame.
            if ( cruiseWeight > 0.01 ) {
                if ( ! this.cruiseTrail.mesh.visible ) {
                    this.cruiseTrail.reset();
                    this.cruiseTrail.lastAdvanceTime = 0;
                    this.cruiseTrail.mesh.visible = true;
                }
                this.cruiseTrail.targetObject.position.set( 0, this.trail_position_y, this.trail_position_z );
                this.cruiseTrail.mesh.material.uniforms.headColor.value.set( 1.0, 0.83, 0.58, 0.8 * cruiseWeight );
                this.cruiseTrail.mesh.material.uniforms.tailColor.value.set( 0.52, 0.16, 0.14, 1.0 * cruiseWeight );
                this.cruiseTrail.update();
            }
            else {
                this.cruiseTrail.mesh.material.uniforms.headColor.value.w = 0;
                this.cruiseTrail.mesh.material.uniforms.tailColor.value.w = 0;
                this.cruiseTrail.mesh.visible = false;
            }

            // Soft overdrive cylinder.
            if ( overdriveWeight > 0.01 ) {
                if ( ! this.trail.mesh.visible ) {
                    this.trail.reset();
                    this.trail.lastAdvanceTime = 0;
                    this.trail.mesh.visible = true;
                    this.trailAnchor.copy( this.mesh.position );
                }

                this.trail.targetObject.position.set(
                    ( Math.random() * 2 - 1 ) * jitter,
                    this.trail_position_y + ( Math.random() * 2 - 1 ) * jitter * 0.5,
                    this.trail_position_z
                );
                this.trail.mesh.material.uniforms.headColor.value.set( 1.0, 0.83, 0.58, 0.9 * overdriveWeight );
                this.trail.mesh.material.uniforms.tailColor.value.set( 0.52, 0.16, 0.14, 0.0 );

                traveled = this.mesh.position.distanceTo( this.trailAnchor );
                steps = Math.min( 5, Math.floor( traveled / Math.max( 0.05, nodeSpacing ) ) );
                for ( i = 0; i < steps; i++ ) {
                    this.trail.advance();
                }
                if ( steps > 0 && traveled > 0 ) {
                    this.trailAnchor.lerp( this.mesh.position, ( steps * nodeSpacing ) / traveled );
                }
                this.trail.updateHead();
                this.trail.geometry.computeBoundingSphere();
            }
            else {
                this.trail.mesh.material.uniforms.headColor.value.w = 0;
                this.trail.mesh.material.uniforms.tailColor.value.w = 0;
                this.trail.mesh.visible = false;
            }
        }
        else {
            this.cruiseTrail.mesh.material.uniforms.headColor.value.set( 1.0, 0.83, 0.58, 0 );
            this.cruiseTrail.mesh.material.uniforms.tailColor.value.set( 0.52, 0.16, 0.14, 0 );
            this.cruiseTrail.mesh.visible = false;
            this.trail.mesh.material.uniforms.headColor.value.set( 1.0, 0.83, 0.58, 0 );
            this.trail.mesh.material.uniforms.tailColor.value.set( 0.52, 0.16, 0.14, 0 );
            this.trail.mesh.visible = false;
            this.overdriveBlend = 0;
        }
    }

    // Scale thruster meshes with airspeed. overdriveBoost lengthens cylinders past cruise.
    animateThruster( airSpeed, burnerMesh, ratio, overdriveBoost = 0 ) {
        let cruiseSpeed = Math.min( Math.abs( airSpeed ), 4.5 );
        burnerMesh.scale.y = 1 + cruiseSpeed * ratio + overdriveBoost * ratio * 2.8;
        burnerMesh.position.y = cruiseSpeed * ratio * 0.5 + overdriveBoost * ratio * 1.25;
    }

    spinThruster( airSpeed, burnerMesh, rotation_factor ) {
        burnerMesh.rotation.y += airSpeed / 50. * rotation_factor;
    }

}
