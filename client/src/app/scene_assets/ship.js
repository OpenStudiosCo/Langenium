/**
 * Ship loader
 * 
 * Currently hardcoded to use the Valiant aircraft.
 */
import * as THREE from 'three';

import { TrailRenderer } from '../../vendor/TrailRenderer.js';

import { brightenMaterial, proceduralMetalMaterial } from '../materials.js';

import Valiant from '../../../../game/src/objects/aircraft/valiant';

export default class Ship {

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
        this.default_camera_distance = window.innerWidth < window.innerHeight ? -70 : -35;
        this.trail_position_y = 1.2;
        this.trail_position_z = 1.5;
        this.camera_distance = 0;

        this.ready = false;

        this.state = new Valiant();
    }

    // Loads the ship model inc built-in animations
    async load() {


        this.model = await window.l.current_scene.loaders.gtlf.loadAsync( './assets/models/mercenary4.glb' );

        let amount = window.l.current_scene.fast ? 5 : 2.5;

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
                            emitColour2   :  { value: new THREE.Vector4( 1.0, 0.0, 0.0, 0.63 ) },        // Emission gradient colour 2
                        }
                    } );

                }
                else {
                    brightenMaterial( child.material, amount );
                }

            }

        } );

        this.mesh = this.model.scene;
        this.mesh.position.z = window.l.current_scene.room_depth;
        this.mesh.rotation.order = 'YXZ';

        this.createThruster();

        this.mixer = new THREE.AnimationMixer( this.mesh );
        this.mixer.clipAction( this.model.animations[ 0 ] ).play();
        this.mixer.clipAction( this.model.animations[ 1 ] ).play();

        window.l.current_scene.tweens.shipEnterY = this.shipEnterY();
        window.l.current_scene.tweens.shipEnterZ = this.shipEnterZ();

        //window.l.current_scene.effects.particles.createShipThruster(this, 1.5, { x: 0, y: 1.2, z: 1.5 });

        // specify points to create planar trail-head geometry
        const trailHeadGeometry = this.createTrailCircle();

        // create the trail renderer object
        this.trail = new TrailRenderer( window.l.current_scene.scene, false );

        // set how often a new trail node will be added and existing nodes will be updated
        this.trail.setAdvanceFrequency( 60 );

        // create material for the trail renderer
        const trailMaterial = TrailRenderer.createBaseMaterial();

        trailMaterial.depthWrite = true;
        trailMaterial.depthBias = -0.0001; // Adjust depth bias as needed
        trailMaterial.depthBiasConstant = 0; // Adjust depth bias constant term if necessary
        trailMaterial.depthBiasSlope = 0; // Adjust depth bias slope term if necessary

        trailMaterial.side = THREE.DoubleSide;

        trailMaterial.transparent = true;

        trailMaterial.uniforms.headColor.value.set( 255 / 255, 212 / 255, 148 / 255, .8 ); // RGBA.
        trailMaterial.uniforms.tailColor.value.set( 132 / 255, 42 / 255, 36 / 255, .0 ); // RGBA.

        // specify length of trail
        const trailLength = 4;

        const trailContainer = new THREE.Object3D();
        trailContainer.position.set( 0, this.trail_position_y, this.trail_position_z );
        this.mesh.add( trailContainer );

        // initialize the trail
        this.trail.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, trailContainer );

        // activate the trail
        this.trail.activate();

    }

    createTrailCircle() {
        let circlePoints = [];
        const twoPI = Math.PI * 2;
        let index = 0;
        const scale = .25;
        const inc = twoPI / 32.0;

        for ( let i = 0; i <= twoPI + inc; i += inc ) {
            const vector = new THREE.Vector3();
            vector.set( Math.cos( i ) * scale, Math.sin( i ) * scale, 0 );
            circlePoints[ index ] = vector;
            index++;
        }
        return circlePoints;
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
            .to( target, window.l.current_scene.skipintro ? 0 : 2000 ) // Move to (300, 200) in 1 second.
            .easing( TWEEN.Easing.Circular.Out ) // Use an easing function to make the animation smooth.
            .onUpdate( () => {
                window.l.current_scene.scene_objects.ship.mesh.position.y = coords.y;
            } )
            .onComplete( () => {
                //console.log('ready');
            } );
    }
    // Tween for the ship intro sequence.
    shipEnterZ() {
        let coords = { x: window.l.current_scene.room_depth }; // Start at (0, 0)
        let target = { x: 0 };
        return new TWEEN.Tween( coords, false ) // Create a new tween that modifies 'coords'.
            .delay( window.l.current_scene.skipintro ? 0 : 1000 )
            .to( target, window.l.current_scene.skipintro ? 0 : 2000 ) // Move to (300, 200) in 1 second.
            .easing( TWEEN.Easing.Circular.Out ) // Use an easing function to make the animation smooth.
            .onUpdate( () => {

                // Called after tween.js updates 'coords'.
                // Move 'box' to the position described by 'coords' with a CSS translation.
                window.l.current_scene.scene_objects.ship.mesh.position.z = coords.x;

            } )
            .onComplete( () => {

                // Turn off bloom from the other scene.
                if ( window.l.current_scene.effects.postprocessing && window.l.current_scene.effects.postprocessing.passes.length > 0 ) {
                    window.l.current_scene.effects.postprocessing.passes.forEach( ( effectPass ) => {
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
                window.l.current_scene.scene_objects.ship.ready = true;
                window.l.current_scene.scene_objects.ship.camera_distance = window.l.current_scene.scene_objects.ship.default_camera_distance + ( window.l.current_scene.room_depth / 2 );
                window.l.current_scene.scene_objects.ship.state.position.x = window.l.current_scene.scene_objects.ship.mesh.position.x;
                window.l.current_scene.scene_objects.ship.state.position.y = window.l.current_scene.scene_objects.ship.mesh.position.y;
                window.l.current_scene.scene_objects.ship.state.position.z = window.l.current_scene.scene_objects.ship.mesh.position.z;
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
            if ( window.l.controls.keyboard.pressed( keyMapping ) ) {
                window.l.current_scene.scene_objects.ship.state.controls[ controlName ] = true;
                changing = true;
            }
            else {

                window.l.current_scene.scene_objects.ship.state.controls[ controlName ] = false;

                if ( window.l.controls.touch ) {
                    // Check if any touchpad controls are being pressed
                    if (
                        window.l.controls.touch.controls.moveUp ||
                        window.l.controls.touch.controls.moveDown ||
                        window.l.controls.touch.controls.moveForward ||
                        window.l.controls.touch.controls.moveBackward ||
                        window.l.controls.touch.controls.moveLeft ||
                        window.l.controls.touch.controls.moveRight
                    ) {
                        changing = true;
                        if ( window.l.controls.touch.controls.moveUp ) {
                            window.l.current_scene.scene_objects.ship.state.controls.moveUp = true;
                        }
                        if ( window.l.controls.touch.controls.moveDown ) {
                            window.l.current_scene.scene_objects.ship.state.controls.moveDown = true;
                        }
                        if ( window.l.controls.touch.controls.moveForward ) {
                            window.l.current_scene.scene_objects.ship.state.controls.throttleUp = true;
                        }
                        if ( window.l.controls.touch.controls.moveBackward ) {
                            window.l.current_scene.scene_objects.ship.state.controls.throttleDown = true;
                        }
                        if ( window.l.controls.touch.controls.moveLeft ) {
                            window.l.current_scene.scene_objects.ship.state.controls.moveLeft = true;
                        }
                        if ( window.l.controls.touch.controls.moveRight ) {
                            window.l.current_scene.scene_objects.ship.state.controls.moveRight = true;
                        }
                    }

                }
            }
        }
        window.l.current_scene.scene_objects.ship.state.controls.changing = changing;

    }

    updateAnimation( delta ) {
        if ( window.l.current_scene.scene_objects.ship.mixer ) {
            window.l.current_scene.scene_objects.ship.mixer.update( delta );
        }

        // Rock the ship forward and back when moving horizontally
        if ( window.l.current_scene.scene_objects.ship.state.controls.throttleDown || window.l.current_scene.scene_objects.ship.state.controls.throttleUp ) {
            let pitchChange = window.l.current_scene.scene_objects.ship.state.controls.throttleUp ? -1 : 1;
            if ( Math.abs( window.l.current_scene.scene_objects.ship.mesh.rotation.x ) < 1 / 4 ) {
                window.l.current_scene.scene_objects.ship.mesh.rotation.x += pitchChange / 10 / 180;
            }
        }

        // Rock the ship forward and back when moving vertically
        if (
            window.l.current_scene.scene_objects.ship.state.controls.moveDown
            ||
            window.l.current_scene.scene_objects.ship.state.controls.moveUp
        ) {
            let elevationChange = window.l.current_scene.scene_objects.ship.state.controls.moveDown ? -1 : 1;
            if ( Math.abs( window.l.current_scene.scene_objects.ship.mesh.rotation.x ) < 1 / 8 ) {
                window.l.current_scene.scene_objects.ship.mesh.rotation.x += elevationChange / 10 / 180;
            }

            if ( Math.abs( window.l.current_scene.camera.rotation.x ) < 1 / 8 ) {
                let radian = ( Math.PI / 180 );
                window.l.current_scene.camera.rotation.x += elevationChange * radian / 10;
            }
        }
        else {
            if ( window.l.controls.touch && !window.l.controls.touch.controls.rotationPad.mouseDown )
                window.l.current_scene.camera.rotation.x *= .9;
        }
    }

    // Update the position of the aircraft to spot determined by game logic.
    updateMesh() {
        window.l.current_scene.scene_objects.ship.mesh.position.x = window.l.current_scene.scene_objects.ship.state.position.x;
        window.l.current_scene.scene_objects.ship.mesh.position.y = window.l.current_scene.scene_objects.ship.state.position.y;
        window.l.current_scene.scene_objects.ship.mesh.position.z = window.l.current_scene.scene_objects.ship.state.position.z;

        window.l.current_scene.scene_objects.ship.mesh.rotation.x = window.l.current_scene.scene_objects.ship.state.rotation.x;
        window.l.current_scene.scene_objects.ship.mesh.rotation.y = window.l.current_scene.scene_objects.ship.state.rotation.y;
        window.l.current_scene.scene_objects.ship.mesh.rotation.z = window.l.current_scene.scene_objects.ship.state.rotation.z;
    }

    // Runs on the main animation loop
    animate( delta ) {

        if ( window.l.current_scene.scene_objects.ship.ready ) {

            if ( window.l.current_scene.settings.game_controls ) {
                // Detect keyboard input and pass it to the ship state model.
                window.l.current_scene.scene_objects.ship.updateControls();

                if ( window.l.multiplayer.connected ) {
                    window.l.multiplayer.socket.emit( 'input', window.l.current_scene.scene_objects.ship.state.controls );
                }
            }

            window.l.current_scene.scene_objects.ship.updateAnimation( delta );

            // Update the ships state model.
            let [ rY, tY, tZ ] = window.l.current_scene.scene_objects.ship.state.move( window.l.current_scene.stats.currentTime - window.l.current_scene.stats.lastTime );
            window.l.current_scene.scene_objects.ship.updateMesh();

            var radian = ( Math.PI / 180 );

            window.l.current_scene.scene_objects.ship.camera_distance = window.l.current_scene.scene_objects.ship.default_camera_distance + ( window.l.current_scene.room_depth / 2 );
            if ( window.l.current_scene.scene_objects.ship.state.airSpeed < 0 ) {
                window.l.current_scene.scene_objects.ship.camera_distance -= window.l.current_scene.scene_objects.ship.state.airSpeed * 4;
            }

            // Check we aren't in debug mode which uses orbit controls
            if ( !window.l.current_scene.debug ) {
                let xDiff = window.l.current_scene.scene_objects.ship.mesh.position.x;
                let zDiff = window.l.current_scene.scene_objects.ship.mesh.position.z;

                window.l.current_scene.camera.position.x = xDiff + window.l.current_scene.scene_objects.ship.camera_distance * Math.sin( window.l.current_scene.scene_objects.ship.mesh.rotation.y );
                window.l.current_scene.camera.position.z = zDiff + window.l.current_scene.scene_objects.ship.camera_distance * Math.cos( window.l.current_scene.scene_objects.ship.mesh.rotation.y );
            }

            //window.l.current_scene.camera.position.z = zDiff + window.l.current_scene.scene_objects.ship.camera_distance * Math.cos(window.l.current_scene.scene_objects.ship.mesh.rotation.y);

            if ( rY != 0 ) {

                window.l.current_scene.camera.rotation.y += rY;
            }
            else {
                // Check there is y difference and the rotation pad isn't being pressed.                   
                if (
                    window.l.current_scene.camera.rotation.y != window.l.current_scene.scene_objects.ship.mesh.rotation.y &&
                    ( window.l.controls.touch && !window.l.controls.touch.controls.rotationPad.mouseDown )
                ) {

                    // Get the difference in y rotation betwen the camera and ship
                    let yDiff = window.l.current_scene.scene_objects.ship.mesh.rotation.y - window.l.current_scene.camera.rotation.y;

                    // Check the y difference is larger than 1/100th of a radian
                    if (
                        Math.abs( yDiff ) > radian / 100
                    ) {
                        // Add 1/60th of the difference in rotation, as FPS currently capped to 60.
                        window.l.current_scene.camera.rotation.y += ( window.l.current_scene.scene_objects.ship.mesh.rotation.y - window.l.current_scene.camera.rotation.y ) * 1 / 60;
                    }
                    else {
                        window.l.current_scene.camera.rotation.y = window.l.current_scene.scene_objects.ship.mesh.rotation.y;
                    }

                }

            }

            let xDiff2 = tZ * Math.sin( window.l.current_scene.scene_objects.ship.mesh.rotation.y ),
                zDiff2 = tZ * Math.cos( window.l.current_scene.scene_objects.ship.mesh.rotation.y );

            if ( window.l.current_scene.scene_objects.ship.mesh.position.y + tY >= 1 ) {
                window.l.current_scene.camera.position.y += tY;
            }

            window.l.current_scene.camera.position.x += xDiff2;
            window.l.current_scene.camera.position.z += zDiff2;

            window.l.current_scene.camera.updateProjectionMatrix();

            if ( window.l.controls.orbit ) {

                window.l.controls.orbit.target.set(
                    window.l.current_scene.scene_objects.ship.mesh.position.x,
                    window.l.current_scene.scene_objects.ship.mesh.position.y,
                    window.l.current_scene.scene_objects.ship.mesh.position.z
                );

                // window.l.controls.orbit.target.set(
                //     window.l.current_scene.scene_objects.extractor.mesh.position.x,
                //     window.l.current_scene.scene_objects.extractor.mesh.position.y + window.l.current_scene.scene_objects.extractor.mesh.scale.x,
                //     window.l.current_scene.scene_objects.extractor.mesh.position.z
                // );
                window.l.controls.orbit.update();
            }



            if ( window.l.current_scene.scene_objects.ship.trail ) {

                // Fix the trail being too far behind.
                let trailOffset = 0;

                // Only offset the trail effect if we are going forward which is (z-1) in numerical terms
                if ( window.l.current_scene.scene_objects.ship.state.airSpeed < 0 ) {

                    // Update ship thruster
                    window.l.current_scene.scene_objects.ship.animateThruster( window.l.current_scene.scene_objects.ship.state.airSpeed, window.l.current_scene.scene_objects.ship.thruster.centralConeBurner, .5 );
                    window.l.current_scene.scene_objects.ship.animateThruster( window.l.current_scene.scene_objects.ship.state.airSpeed, window.l.current_scene.scene_objects.ship.thruster.outerCylBurner, .5 );

                    window.l.current_scene.scene_objects.ship.spinThruster( window.l.current_scene.scene_objects.ship.state.airSpeed, window.l.current_scene.scene_objects.ship.thruster.rearConeBurner, -1 );
                    window.l.current_scene.scene_objects.ship.spinThruster( window.l.current_scene.scene_objects.ship.state.airSpeed, window.l.current_scene.scene_objects.ship.thruster.centralConeBurner, 1 );
                    window.l.current_scene.scene_objects.ship.spinThruster( window.l.current_scene.scene_objects.ship.state.airSpeed, window.l.current_scene.scene_objects.ship.thruster.outerCylBurner, -1 );
                    window.l.current_scene.scene_objects.ship.spinThruster( window.l.current_scene.scene_objects.ship.state.airSpeed, window.l.current_scene.scene_objects.ship.thruster.innerCylBurner, 1 );

                    // Limit playback rate to 5x as large values freak out the browser.
                    window.l.current_scene.scene_objects.ship.thruster.videoElement.playbackRate = Math.min( 5, 0.25 + Math.abs( window.l.current_scene.scene_objects.ship.state.airSpeed ) );

                    trailOffset += window.l.current_scene.scene_objects.ship.trail_position_z - Math.abs( window.l.current_scene.scene_objects.ship.state.airSpeed );

                    window.l.current_scene.scene_objects.ship.trail.mesh.material.uniforms.headColor.value.set( 255 / 255, 212 / 255, 148 / 255, .8 ); // RGBA.                    
                }
                else {
                    window.l.current_scene.scene_objects.ship.trail.mesh.material.uniforms.headColor.value.set( 255 / 255, 212 / 255, 148 / 255, 0 ); // RGBA.
                }

                // Update the trail position based on above calculations.
                window.l.current_scene.scene_objects.ship.trail.targetObject.position.y = window.l.current_scene.scene_objects.ship.trail_position_y + window.l.current_scene.scene_objects.ship.state.verticalSpeed;
                window.l.current_scene.scene_objects.ship.trail.targetObject.position.z = trailOffset;

                if ( rY != 0 ) {
                    window.l.current_scene.scene_objects.ship.trail.targetObject.position.x = rY * window.l.current_scene.scene_objects.ship.state.airSpeed;
                    window.l.current_scene.scene_objects.ship.trail.targetObject.position.y += Math.abs( window.l.current_scene.scene_objects.ship.trail.targetObject.position.x ) / 4;
                }
                else {
                    window.l.current_scene.scene_objects.ship.trail.targetObject.position.x = 0;
                }
                window.l.current_scene.scene_objects.ship.trail.update();
            }

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
