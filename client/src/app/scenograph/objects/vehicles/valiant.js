/**
 * Valiant Aircraft
 *
 * Provides a Valiant aircraft that can be added and updated in the game world.
 *
 * @todo: Uncouple player actor from this ship class.
 */

import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { brightenMaterial, proceduralMetalMaterial } from '@/scenograph/materials.js';
import Player from '#/game/src/actors/player';
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

    constructor() {
        this.default_camera_distance = -35;
        this.trail_position_y = 1.2;
        this.trail_position_z = 1.5;
        this.camera_distance = 0;

        this.ready = false;

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
        this.mesh.name = 'Player Ship';
        this.mesh.position.z = l.current_scene.room_depth;
        this.mesh.rotation.order = 'YXZ';
        this.mesh.scale.setScalar(2);

        this.mesh.userData.targetable = true;
        this.mesh.userData.objectClass = 'player';
        this.mesh.userData.actor = new Player( this.mesh, l.current_scene.scene );
        l.scenograph.entityManager.add( this.mesh.userData.actor.entity );

        this.createThruster();

        this.mixer = new THREE.AnimationMixer( this.mesh );
        this.mixer.clipAction( this.model.animations[ 0 ] ).play();
        this.mixer.clipAction( this.model.animations[ 1 ] ).play();

        l.current_scene.tweens.shipEnterY = this.shipEnterY();
        l.current_scene.tweens.shipEnterZ = this.shipEnterZ();

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

    // Tween for the ship intro sequence.
    shipEnterY() {
        let coords = { y: 60 }; // Start at (0, 0)
        let target = { y: 8.5 };
        return new TWEEN.Tween( coords, false ) // Create a new tween that modifies 'coords'.
            .to( target, l.config.settings.skipintro ? 0 : 2000 ) // Move to (300, 200) in 1 second.
            .easing( TWEEN.Easing.Circular.Out ) // Use an easing function to make the animation smooth.
            .onUpdate( () => {
                l.scenograph.actors.player.vehicle.mesh.position.y = coords.y;
            } )
            .onComplete( () => {
                //console.log('ready');
            } );
    }
    // Tween for the ship intro sequence.
    shipEnterZ() {
        let coords = { x: l.current_scene.room_depth }; // Start at (0, 0)
        let target = { x: 0 };
        return new TWEEN.Tween( coords, false ) // Create a new tween that modifies 'coords'.
            .delay( l.config.settings.skipintro ? 0 : 1000 )
            .to( target, l.config.settings.skipintro ? 0 : 2000 ) // Move to (300, 200) in 1 second.
            .easing( TWEEN.Easing.Circular.Out ) // Use an easing function to make the animation smooth.
            .onUpdate( () => {

                // Called after tween.js updates 'coords'.
                // Move 'box' to the position described by 'coords' with a CSS translation.
                l.scenograph.actors.player.vehicle.mesh.position.z = coords.x;

            } )
            .onComplete( () => {

                // Turn off bloom from the other scene.
                if ( l.current_scene.effects.postprocessing && l.current_scene.effects.postprocessing.passes.length > 0 ) {
                    l.current_scene.effects.postprocessing.passes.forEach( ( effectPass ) => {
                        if ( effectPass.name == 'EffectPass' ) {
                            effectPass.effects.forEach( ( effect ) => {
                                if ( effect.name == 'BloomEffect' ) {
                                    effect.blendMode.setOpacity( 0 );
                                }
                            } );
                        }

                    } );
                }

                // Set the ship as ready.
                l.scenograph.actors.player.vehicle.ready = true;
                l.scenograph.actors.player.vehicle.camera_distance = l.scenograph.actors.player.vehicle.default_camera_distance + ( l.current_scene.room_depth / 2 );
                l.scenograph.actors.player.vehicle.mesh.userData.object.position.x = l.scenograph.actors.player.vehicle.mesh.position.x;
                l.scenograph.actors.player.vehicle.mesh.userData.object.position.y = l.scenograph.actors.player.vehicle.mesh.position.y;
                l.scenograph.actors.player.vehicle.mesh.userData.object.position.z = l.scenograph.actors.player.vehicle.mesh.position.z;
            } );
    }

    // Internal helper to manage state changes of aircraft controls.
    updateControls() {
        let mappings = {
            throttleUp  :  'W',
            throttleDown:  'S',
            moveUp      :  ' ',
            moveDown    :  'shift',
            moveLeft    :  'A',
            moveRight   :  'D',
        }
        let changing = false;
        for ( const [ controlName, keyMapping ] of Object.entries( mappings ) ) {
            if ( l.scenograph.controls.keyboard.pressed( keyMapping ) ) {
                l.scenograph.actors.player.vehicle.mesh.userData.object.controls[ controlName ] = true;
                changing = true;
            }
            else {

                l.scenograph.actors.player.vehicle.mesh.userData.object.controls[ controlName ] = false;

                if ( l.scenograph.controls.touch ) {
                    // Check if any touchpad controls are being pressed
                    if (
                        l.scenograph.controls.touch.controls.moveUp ||
                        l.scenograph.controls.touch.controls.moveDown ||
                        l.scenograph.controls.touch.controls.moveForward ||
                        l.scenograph.controls.touch.controls.moveBackward ||
                        l.scenograph.controls.touch.controls.moveLeft ||
                        l.scenograph.controls.touch.controls.moveRight
                    ) {
                        changing = true;
                        if ( l.scenograph.controls.touch.controls.moveUp ) {
                            l.scenograph.actors.player.vehicle.mesh.userData.object.controls.moveUp = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveDown ) {
                            l.scenograph.actors.player.vehicle.mesh.userData.object.controls.moveDown = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveForward ) {
                            l.scenograph.actors.player.vehicle.mesh.userData.object.controls.throttleUp = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveBackward ) {
                            l.scenograph.actors.player.vehicle.mesh.userData.object.controls.throttleDown = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveLeft ) {
                            l.scenograph.actors.player.vehicle.mesh.userData.object.controls.moveLeft = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveRight ) {
                            l.scenograph.actors.player.vehicle.mesh.userData.object.controls.moveRight = true;
                        }
                    }

                }
            }
        }
        l.scenograph.actors.player.vehicle.mesh.userData.object.controls.changing = changing;

    }

    updateAnimation( delta ) {
        if ( l.scenograph.actors.player.vehicle.mixer ) {
            l.scenograph.actors.player.vehicle.mixer.update( delta );
        }

        // Rock the ship forward and back when moving horizontally
        if ( l.scenograph.actors.player.vehicle.mesh.userData.object.controls.throttleDown || l.scenograph.actors.player.vehicle.mesh.userData.object.controls.throttleUp ) {
            let pitchChange = l.scenograph.actors.player.vehicle.mesh.userData.object.controls.throttleUp ? -1 : 1;
            if ( Math.abs( l.scenograph.actors.player.vehicle.mesh.rotation.x ) < 1 / 4 ) {
                l.scenograph.actors.player.vehicle.mesh.rotation.x += pitchChange / 10 / 180;
            }
        }

        // Rock the ship forward and back when moving vertically
        if (
            l.scenograph.actors.player.vehicle.mesh.userData.object.controls.moveDown
            ||
            l.scenograph.actors.player.vehicle.mesh.userData.object.controls.moveUp
        ) {
            let elevationChange = l.scenograph.actors.player.vehicle.mesh.userData.object.controls.moveDown ? -1 : 1;
            if ( Math.abs( l.scenograph.actors.player.vehicle.mesh.rotation.x ) < 1 / 8 ) {
                l.scenograph.actors.player.vehicle.mesh.rotation.x += elevationChange / 10 / 180;
            }

            if ( Math.abs( l.scenograph.cameras.player.rotation.x ) < 1 / 8 ) {
                let radian = ( Math.PI / 180 );
                l.scenograph.cameras.player.rotation.x += elevationChange * radian / 10;
            }
        }
        else {
            if ( l.scenograph.controls.touch && !l.scenograph.controls.touch.controls.rotationPad.mouseDown )
                l.scenograph.cameras.player.rotation.x *= .9;
        }
    }

    // Update the position of the aircraft to spot determined by game logic.
    updateMesh() {
        l.scenograph.actors.player.vehicle.mesh.position.x = l.scenograph.actors.player.vehicle.mesh.userData.object.position.x;
        l.scenograph.actors.player.vehicle.mesh.position.y = l.scenograph.actors.player.vehicle.mesh.userData.object.position.y;
        l.scenograph.actors.player.vehicle.mesh.position.z = l.scenograph.actors.player.vehicle.mesh.userData.object.position.z;
        l.scenograph.actors.player.vehicle.mesh.rotation.x = l.scenograph.actors.player.vehicle.mesh.userData.object.rotation.x;
        l.scenograph.actors.player.vehicle.mesh.rotation.y = l.scenograph.actors.player.vehicle.mesh.userData.object.rotation.y;
        l.scenograph.actors.player.vehicle.mesh.rotation.z = l.scenograph.actors.player.vehicle.mesh.userData.object.rotation.z;
    }

    updateCamera( rY, tY, tZ ) {
        var radian = ( Math.PI / 180 );

        l.scenograph.actors.player.vehicle.camera_distance = l.scenograph.actors.player.vehicle.default_camera_distance + ( l.current_scene.room_depth / 2 );
        if ( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed < 0 ) {
            l.scenograph.actors.player.vehicle.camera_distance -= l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed * 4;
        }

        let xDiff = l.scenograph.actors.player.vehicle.mesh.position.x;
        let zDiff = l.scenograph.actors.player.vehicle.mesh.position.z;

        l.scenograph.cameras.player.position.x = xDiff + l.scenograph.actors.player.vehicle.camera_distance * Math.sin( l.scenograph.actors.player.vehicle.mesh.rotation.y );
        l.scenograph.cameras.player.position.z = zDiff + l.scenograph.actors.player.vehicle.camera_distance * Math.cos( l.scenograph.actors.player.vehicle.mesh.rotation.y );

        if ( rY != 0 ) {

            l.scenograph.cameras.player.rotation.y += rY;
        }
        else {
            // Check there is y difference and the rotation pad isn't being pressed.
            if (
                l.scenograph.cameras.player.rotation.y != l.scenograph.actors.player.vehicle.mesh.rotation.y &&
                ( l.scenograph.controls.touch && !l.scenograph.controls.touch.controls.rotationPad.mouseDown )
            ) {

                // Get the difference in y rotation betwen the camera and ship
                let yDiff = l.scenograph.actors.player.vehicle.mesh.rotation.y - l.scenograph.cameras.player.rotation.y;

                // Check the y difference is larger than 1/100th of a radian
                if (
                    Math.abs( yDiff ) > radian / 100
                ) {
                    // Add 1/60th of the difference in rotation, as FPS currently capped to 60.
                    l.scenograph.cameras.player.rotation.y += ( l.scenograph.actors.player.vehicle.mesh.rotation.y - l.scenograph.cameras.player.rotation.y ) * 1 / 60;
                }
                else {
                    l.scenograph.cameras.player.rotation.y = l.scenograph.actors.player.vehicle.mesh.rotation.y;
                }

            }

        }

        let xDiff2 = tZ * Math.sin( l.scenograph.actors.player.vehicle.mesh.rotation.y ),
            zDiff2 = tZ * Math.cos( l.scenograph.actors.player.vehicle.mesh.rotation.y );

        if ( l.scenograph.actors.player.vehicle.mesh.position.y + tY >= 1 ) {
            l.scenograph.cameras.player.position.y += tY;
        }

        l.scenograph.cameras.player.position.x += xDiff2;
        l.scenograph.cameras.player.position.z += zDiff2;

        l.scenograph.cameras.player.updateProjectionMatrix();
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

        if ( l.scenograph.actors.player.vehicle.ready ) {

            if ( l.current_scene.settings.game_controls ) {

                if ( l.scenograph.actors.player.mode == 'vehicle' ) {
                    // Detect keyboard input and pass it to the ship state model.
                    l.scenograph.actors.player.vehicle.updateControls();
                }

                if ( l.scenograph.modes.multiplayer.connected ) {
                    l.scenograph.modes.multiplayer.socket.emit( 'input', l.scenograph.actors.player.vehicle.mesh.userData.object.controls );
                }

                l.scenograph.actors.player.vehicle.mesh.userData.actor.animate( delta );

            }

            if (  l.mode != 'hangar')
                l.scenograph.actors.player.vehicle.updateAnimation( delta );

            // Update the ships state model.
            let [ rY, tY, tZ ] = l.scenograph.actors.player.vehicle.mesh.userData.object.move( l.current_scene.stats.currentTime - l.current_scene.stats.lastTime );
            l.scenograph.actors.player.vehicle.updateMesh();

            l.scenograph.actors.player.vehicle.updateCamera( rY, tY, tZ );

            l.scenograph.actors.player.vehicle.animateTrail( rY );

        }
    }

    animateTrail( rY ) {
        if ( l.scenograph.actors.player.vehicle.trail ) {

            // Fix the trail being too far behind.
            let trailOffset = 0;

            // Only offset the trail effect if we are going forward which is (z-1) in numerical terms
            if ( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed < 0 ) {

                // Update ship thruster
                l.scenograph.actors.player.vehicle.animateThruster( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed, l.scenograph.actors.player.vehicle.thruster.centralConeBurner, .5 );
                l.scenograph.actors.player.vehicle.animateThruster( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed, l.scenograph.actors.player.vehicle.thruster.outerCylBurner, .5 );

                l.scenograph.actors.player.vehicle.spinThruster( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed, l.scenograph.actors.player.vehicle.thruster.rearConeBurner, -1 );
                l.scenograph.actors.player.vehicle.spinThruster( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed, l.scenograph.actors.player.vehicle.thruster.centralConeBurner, 1 );
                l.scenograph.actors.player.vehicle.spinThruster( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed, l.scenograph.actors.player.vehicle.thruster.outerCylBurner, -1 );
                l.scenograph.actors.player.vehicle.spinThruster( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed, l.scenograph.actors.player.vehicle.thruster.innerCylBurner, 1 );

                // Limit playback rate to 5x as large values freak out the browser.
                l.scenograph.actors.player.vehicle.thruster.videoElement.playbackRate = Math.min( 5, 0.25 + Math.abs( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed ) );

                trailOffset += l.scenograph.actors.player.vehicle.trail_position_z - Math.abs( l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed );

                l.scenograph.actors.player.vehicle.trail.mesh.material.uniforms.headColor.value.set( 255 / 255, 212 / 255, 148 / 255, .8 ); // RGBA.
            }
            else {
                l.scenograph.actors.player.vehicle.trail.mesh.material.uniforms.headColor.value.set( 255 / 255, 212 / 255, 148 / 255, 0 ); // RGBA.
            }

            // Update the trail position based on above calculations.
            l.scenograph.actors.player.vehicle.trail.targetObject.position.y = l.scenograph.actors.player.vehicle.trail_position_y + l.scenograph.actors.player.vehicle.mesh.userData.object.verticalSpeed;
            l.scenograph.actors.player.vehicle.trail.targetObject.position.z = trailOffset;

            if ( rY != 0 ) {
                l.scenograph.actors.player.vehicle.trail.targetObject.position.x = rY * l.scenograph.actors.player.vehicle.mesh.userData.object.airSpeed;
                l.scenograph.actors.player.vehicle.trail.targetObject.position.y += Math.abs( l.scenograph.actors.player.vehicle.trail.targetObject.position.x ) / 4;
            }
            else {
                l.scenograph.actors.player.vehicle.trail.targetObject.position.x = 0;
            }
            //l.scenograph.actors.player.vehicle.trail.update();
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
