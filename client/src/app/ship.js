/**
 * Ship loader
 */
import * as THREE from 'three';

import {brightenMaterial} from './furniture.js';


export default class Ship {

    // Ship Model (gltf)
    model;

    // The ship mesh.
    mesh;

    // Animation mixer.
    mixer;

    constructor() {

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
                console.log('ready');
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
                console.log('ready');
            });
    }

    animate( delta ) {
        if (window.test_scene.scene_objects.ship.mixer) {
            window.test_scene.scene_objects.ship.mixer.update( delta );
        }
    }
    
}
