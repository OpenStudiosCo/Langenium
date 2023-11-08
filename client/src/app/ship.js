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
            console.log(child);
    
          if ( child.isMesh ) {
    
            child.castShadow = true;
    
            child.original_material = child.material.clone();
            
            brightenMaterial(child.material, amount);
    
          }
    
        } );
        
        this.mesh = this.model.scene;
        this.mixer = new THREE.AnimationMixer( this.mesh );
        this.mixer.clipAction( this.model.animations[ 0 ] ).play();
        this.mixer.clipAction( this.model.animations[ 1 ] ).play();

    }

    animate( delta ) {
        if (window.test_scene.scene_objects.ship.mixer) {
            window.test_scene.scene_objects.ship.mixer.update( delta );
        }
    }
    
}
