/**
 * Ship loader
 */
import * as THREE from 'three';

import {brightenMaterial} from './furniture.js';


export default class Ship {

    // Ship Model
    model;

    // The ship mesh.
    mesh;

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

    }

    animate( delta ) {
        
        // if (this.mesh.current_frame < this.mesh.total_frames) {
        //     this.mesh.morphTargetInfluences[this.mesh.current_frame] = 0;
        //     this.mesh.current_frame += 1;
        //     this.mesh.morphTargetInfluences[this.mesh.current_frame] = 1;
        // }
        // else {
        //     this.mesh.morphTargetInfluences[this.mesh.current_frame] = 0;
        //     this.mesh.current_frame = 0;
        //     this.mesh.morphTargetInfluences[this.mesh.current_frame] = 0;
        // }
    }
    
}
