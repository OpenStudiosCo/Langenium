/**
 * Ship loader
 * 
 * Currently hardcoded to use the Valiant aircraft.
 */
import * as THREE from 'three';

import {brightenMaterial} from './materials.js';

import Valiant from '../../../game/objects/aircraft/valiant';

export default class Ship {

    // Camera distance.
    camera_distance;

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

    constructor() {
        this.camera_distance = 0;

        this.ready = false;

        this.state = new Valiant();
    }

    // Loads the ship model inc built-in animations
    async load() {
        

        this.model = await window.test_scene.loaders.gtlf.loadAsync( './assets/models/mercenary3.glb');

        let amount = window.test_scene.fast ? 5 : 2.5;

        this.model.scene.traverse( function ( child ) {
    
            if ( child.isMesh ) {

                child.castShadow = true;

                child.original_material = child.material.clone();

                brightenMaterial(child.material, amount);

            }
    
        } );
        
        this.mesh = this.model.scene;
        this.mesh.position.z = window.test_scene.room_depth;
        this.mesh.rotation.order = 'YXZ';

        this.mixer = new THREE.AnimationMixer( this.mesh );
        this.mixer.clipAction( this.model.animations[ 0 ] ).play();
        this.mixer.clipAction( this.model.animations[ 1 ] ).play();

        window.test_scene.tweens.shipEnterY = this.shipEnterY();
        window.test_scene.tweens.shipEnterZ = this.shipEnterZ();

    }

    // Tween for the ship intro sequence.
    shipEnterY() {
        let coords = { y: 60 }; // Start at (0, 0)
        let target = { y: 8.5 };
        return new TWEEN.Tween(coords, false) // Create a new tween that modifies 'coords'.
            .to(target, 2000) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Circular.Out) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                window.test_scene.scene_objects.ship.mesh.position.y = coords.y;
            })
            .onComplete(() => {
                //console.log('ready');
            });
    }
    // Tween for the ship intro sequence.
    shipEnterZ() {
        let coords = { x: window.test_scene.room_depth }; // Start at (0, 0)
        let target = { x: 0 };
        return new TWEEN.Tween(coords, false) // Create a new tween that modifies 'coords'.
            .delay(1000)
            .to(target, 2000) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Circular.Out) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                // Called after tween.js updates 'coords'.
                // Move 'box' to the position described by 'coords' with a CSS translation.
                window.test_scene.scene_objects.ship.mesh.position.z = coords.x;
            })
            .onComplete(() => {
                window.test_scene.scene_objects.ship.ready = true;
                window.test_scene.scene_objects.ship.camera_distance = -20 + (window.test_scene.room_depth / 2);
                window.test_scene.scene_objects.ship.state.position.x = window.test_scene.scene_objects.ship.mesh.position.x;
                window.test_scene.scene_objects.ship.state.position.y = window.test_scene.scene_objects.ship.mesh.position.y;
                window.test_scene.scene_objects.ship.state.position.z = window.test_scene.scene_objects.ship.mesh.position.z;
            });
    }

    // Internal helper to manage state changes of aircraft controls.
    updateControls() {
        let mappings = {
            throttleUp:     'W',
            throttleDown:   'S',
            moveUp:         ' ',
            moveDown:       'shift',
            moveLeft:       'A',
            moveRight:      'D',
        }
        for ( const [ controlName, keyMapping ] of Object.entries(mappings)) {
            if (window.test_scene.controls.keyboard.pressed(keyMapping)) {
                window.test_scene.scene_objects.ship.state.controls[controlName] = true;
            }
            else {
                window.test_scene.scene_objects.ship.state.controls[controlName] = false;
            }
        }

    }

    // Update the position of the aircraft to spot determined by game logic.
    updatePosition() {
        window.test_scene.scene_objects.ship.mesh.position.x = window.test_scene.scene_objects.ship.state.position.x;
        window.test_scene.scene_objects.ship.mesh.position.y = window.test_scene.scene_objects.ship.state.position.y;
        window.test_scene.scene_objects.ship.mesh.position.z = window.test_scene.scene_objects.ship.state.position.z;
    }


    // Runs on the main animation loop
    animate( delta ) {
        if (window.test_scene.scene_objects.ship.mixer) {
            window.test_scene.scene_objects.ship.mixer.update( delta );
        }

        if (window.test_scene.scene_objects.ship.ready) {

            // Detect keyboard input and pass it to the ship state model.
            window.test_scene.scene_objects.ship.updateControls();

            // Update the ships state model.
            window.test_scene.scene_objects.ship.state.move( window.test_scene.stats.currentTime - window.test_scene.stats.lastTime );

            //window.test_scene.scene_objects.ship.updatePosition();

            var rY = 0, 
                tZ = 0, 
                tY = 0,
                radian = (Math.PI / 180);

            
            if (window.test_scene.scene_objects.ship.state.controls.throttleDown || window.test_scene.scene_objects.ship.state.controls.throttleUp) {
                let pitchChange = window.test_scene.scene_objects.ship.state.controls.throttleUp ? -1 : 1;
                // Rock the ship forward and back when moving horizontally
                if (Math.abs(window.test_scene.scene_objects.ship.mesh.rotation.x) < 1 / 4 ) {
                    window.test_scene.scene_objects.ship.mesh.rotation.x += pitchChange / 1 / 180 ;
                }
            }

            // Set change in Y position based on vertical speed
            if (Math.abs(window.test_scene.scene_objects.ship.state.verticalSpeed) > 0.1) {
                tY = window.test_scene.scene_objects.ship.state.verticalSpeed;
            }

            // Rock the ship forward and back when moving vertically
            if (window.test_scene.scene_objects.ship.state.controls.moveDown || window.test_scene.scene_objects.ship.state.controls.moveUp) {
                let elevationChange = window.test_scene.scene_objects.ship.state.controls.moveDown ? -1 : 1;
                if (Math.abs(window.test_scene.scene_objects.ship.mesh.rotation.x) < 1 / 8) {
                    window.test_scene.scene_objects.ship.mesh.rotation.x += elevationChange / 1 / 180 ;
                }
                
                if (Math.abs(window.test_scene.camera.rotation.x) < 1 / 8) {
                    window.test_scene.camera.rotation.x += elevationChange * radian / 10 ;
                }
            }
            else {
                window.test_scene.camera.rotation.x *= .9;
            }

            if (
                !(window.test_scene.scene_objects.ship.state.controls.throttleDown || window.test_scene.scene_objects.ship.state.controls.throttleUp) &&
                !(window.test_scene.scene_objects.ship.state.controls.moveDown || window.test_scene.scene_objects.ship.state.controls.moveUp)
            ) {
                window.test_scene.scene_objects.ship.mesh.rotation.x *= .9;
            }
            
            // Turning
            if (window.test_scene.scene_objects.ship.state.controls.moveLeft) {
                rY += radian;
            }
            else {
                if (window.test_scene.scene_objects.ship.state.controls.moveRight) {
                    rY -= radian;
                }
            }

            if (rY != 0) {
                if (Math.abs(window.test_scene.scene_objects.ship.mesh.rotation.z) < Math.PI / 4) {
                    window.test_scene.scene_objects.ship.mesh.rotation.z += rY / Math.PI;
                }
                
                window.test_scene.scene_objects.ship.mesh.rotation.y += rY;

                const theta = Date.now() * 0.001; // Set the angular velocity for orbiting

                let xDiff = window.test_scene.scene_objects.ship.mesh.position.x;
                let zDiff = window.test_scene.scene_objects.ship.mesh.position.z;

                window.test_scene.camera.position.x = xDiff + window.test_scene.scene_objects.ship.camera_distance * Math.sin(window.test_scene.scene_objects.ship.mesh.rotation.y);
                window.test_scene.camera.position.z = zDiff + window.test_scene.scene_objects.ship.camera_distance * Math.cos(window.test_scene.scene_objects.ship.mesh.rotation.y);
                window.test_scene.camera.rotation.y += rY * 1.1;

            }
            else {
                window.test_scene.scene_objects.ship.mesh.rotation.z *= .9;
                if (window.test_scene.camera.rotation.y != window.test_scene.scene_objects.ship.mesh.rotation.y ) {
                    let yDiff = window.test_scene.scene_objects.ship.mesh.rotation.y - window.test_scene.camera.rotation.y;
                    if (Math.abs(yDiff) > radian / 10) {
                        window.test_scene.camera.rotation.y += (window.test_scene.scene_objects.ship.mesh.rotation.y - window.test_scene.camera.rotation.y) * 1 / 60;
                    }
                    else {
                        window.test_scene.camera.rotation.y = window.test_scene.scene_objects.ship.mesh.rotation.y;
                    }
                    
                }
                
            }

            // Check if we have significant airspeed
            if (Math.abs(window.test_scene.scene_objects.ship.state.airSpeed) > 0.01) {

                // Set change in Z position based on airspeed
                tZ = window.test_scene.scene_objects.ship.state.airSpeed;

            }

            let xDiff = tZ * Math.sin(window.test_scene.scene_objects.ship.mesh.rotation.y),
                zDiff = tZ * Math.cos(window.test_scene.scene_objects.ship.mesh.rotation.y);
            
            if (window.test_scene.scene_objects.ship.mesh.position.y + tY >= 1 ) {
                window.test_scene.scene_objects.ship.mesh.position.y += tY;
                window.test_scene.camera.position.y += tY;
            } else {
                window.test_scene.scene_objects.ship.state.verticalSpeed = 0;
            }
            window.test_scene.scene_objects.ship.mesh.position.x += xDiff;
            window.test_scene.scene_objects.ship.mesh.position.z += zDiff;

            
            window.test_scene.camera.position.x += xDiff;
            window.test_scene.camera.position.z += zDiff;
            window.test_scene.camera.updateProjectionMatrix();

            if (window.test_scene.controls.orbit) {
            
                window.test_scene.controls.orbit.target.set(
                    window.test_scene.scene_objects.ship.mesh.position.x,
                    window.test_scene.scene_objects.ship.mesh.position.y,
                    window.test_scene.scene_objects.ship.mesh.position.z
                );
                window.test_scene.controls.orbit.update();
            }

        }
    }
    
}
