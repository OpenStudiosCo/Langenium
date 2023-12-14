/**
 * Ship loader
 */
import * as THREE from 'three';

import {brightenMaterial} from './materials.js';

export default class Ship {

    // Ship Model (gltf)
    model;

    // The ship mesh.
    mesh;

    // Animation mixer.
    mixer;

    // Ship ready for input (intro sequence finished)
    ready;

    constructor() {
        this.ready = false;
    }

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

        this.mixer = new THREE.AnimationMixer( this.mesh );
        this.mixer.clipAction( this.model.animations[ 0 ] ).play();
        this.mixer.clipAction( this.model.animations[ 1 ] ).play();

        window.test_scene.tweens.shipEnterY = this.shipEnterY();
        window.test_scene.tweens.shipEnterZ = this.shipEnterZ();

    }

    /** Tween */
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
                window.test_scene.scene_objects.ship.mesh.add(window.test_scene.camera);
                window.test_scene.controls.startOrbit();
                window.test_scene.scene_objects.ship.ready = true;
                
            });
    }

    animate( delta ) {
        if (window.test_scene.scene_objects.ship.mixer) {
            window.test_scene.scene_objects.ship.mixer.update( delta );
        }

        if (window.test_scene.scene_objects.ship.ready) {

            var stepSize = 2.5,
                pX = 0,
                pY = 0,
                pZ = 0,
                rY = 0, 
                tZ = 0, 
                tY = 0,
                radian = (Math.PI / 135);

            // Detect keyboard input
            if (window.test_scene.controls.keyboard.pressed("W")) {
                tZ -= stepSize;
            }
            if (window.test_scene.controls.keyboard.pressed("S")) {
                tZ += stepSize;
            }
            if (window.test_scene.controls.keyboard.pressed("A")) {
                rY += radian;
            }
            if (window.test_scene.controls.keyboard.pressed("D")) {
                rY -= radian;
            }
            if (window.test_scene.controls.keyboard.pressed(" ")) {
                tY += stepSize * .6;
            }
            if (window.test_scene.controls.keyboard.pressed("shift")) {
                tY -= stepSize * .6;
            }

            if (rY != 0) {
                window.test_scene.scene_objects.ship.mesh.rotation.y += rY;
            }	

            let xDiff = tZ * Math.sin(window.test_scene.scene_objects.ship.mesh.rotation.y),
                zDiff = tZ * Math.cos(window.test_scene.scene_objects.ship.mesh.rotation.y);
            
            window.test_scene.scene_objects.ship.mesh.position.y += tY;

            window.test_scene.scene_objects.ship.mesh.position.x += xDiff;
            window.test_scene.scene_objects.ship.mesh.position.z += zDiff;

            window.test_scene.camera.lookAt(window.test_scene.scene_objects.ship.mesh.position);
        }
    }
    
}
