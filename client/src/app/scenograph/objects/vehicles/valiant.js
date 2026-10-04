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

    constructor( isDemo = false ) {
        this.default_camera_distance = -35;
        this.trail_position_y = 1.2;
        this.trail_position_z = 1.5;
        this.camera_distance = 0;

        this.ready = false;

        this.demo = isDemo;

    }

    // Loads the ship model inc built-in animations
    async load() {


        this.model = await l.current_scene.loaders.gtlf.loadAsync( './assets/models/mercenary4.glb' );

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

        this.trail = l.current_scene.effects.trail.createTrail( this.mesh, 0, this.trail_position_y, this.trail_position_z );

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

        if ( l.current_scene.objects.demoShip.ready && l.mode != 'hangar' ) {
            this.updateAnimation( delta );
        }
    }

    animateTrail( rY ) {
        if ( this.trail ) {

            // Fix the trail being too far behind.
            let trailOffset = 0;

            // Only offset the trail effect if we are going forward which is (z-1) in numerical terms
            if ( this.mesh.userData.object.airSpeed < 0 ) {

                // Update ship thruster
                this.animateThruster( this.mesh.userData.object.airSpeed, this.thruster.centralConeBurner, .5 );
                this.animateThruster( this.mesh.userData.object.airSpeed, this.thruster.outerCylBurner, .5 );

                this.spinThruster( this.mesh.userData.object.airSpeed, this.thruster.rearConeBurner, -1 );
                this.spinThruster( this.mesh.userData.object.airSpeed, this.thruster.centralConeBurner, 1 );
                this.spinThruster( this.mesh.userData.object.airSpeed, this.thruster.outerCylBurner, -1 );
                this.spinThruster( this.mesh.userData.object.airSpeed, this.thruster.innerCylBurner, 1 );

                // Limit playback rate to 5x as large values freak out the browser.
                this.thruster.videoElement.playbackRate = Math.min( 5, 0.25 + Math.abs( this.mesh.userData.object.airSpeed ) );

                trailOffset += this.trail_position_z - Math.abs( this.mesh.userData.object.airSpeed );

                this.trail.mesh.material.uniforms.headColor.value.set( 255 / 255, 212 / 255, 148 / 255, .8 ); // RGBA.
            }
            else {
                this.trail.mesh.material.uniforms.headColor.value.set( 255 / 255, 212 / 255, 148 / 255, 0 ); // RGBA.
            }

            // Update the trail position based on above calculations.
            this.trail.targetObject.position.y = this.trail_position_y + this.mesh.userData.object.verticalSpeed;
            this.trail.targetObject.position.z = trailOffset;

            if ( rY != 0 ) {
                this.trail.targetObject.position.x = rY * this.mesh.userData.object.airSpeed;
                this.trail.targetObject.position.y += Math.abs( this.trail.targetObject.position.x ) / 4;
            }
            else {
                this.trail.targetObject.position.x = 0;
            }
            this.trail.update();
        }
    }

    animateThruster( airSpeed, burnerMesh, ratio ) {
        if ( Math.abs( airSpeed ) < 4.5 ) {
            burnerMesh.scale.y = 1 + Math.abs( airSpeed ) * ratio;
            burnerMesh.position.y = Math.abs( airSpeed ) * ratio * 0.5;
        }
    }

    spinThruster( airSpeed, burnerMesh, rotation_factor ) {
        burnerMesh.rotation.y += airSpeed / 50. * rotation_factor;
    }

}
