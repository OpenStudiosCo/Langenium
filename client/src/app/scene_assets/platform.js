/**
 * Union Platform
 * 
 * 
 */
import * as THREE from 'three';

import {brightenMaterial} from '../materials.js';

export default class Platform {

    // Platform Model (gltf)
    model;

    constructor() {
        this.ready = false;

    }

    
    // Loads the ship model inc built-in animations
    async load() {
        
        this.model = await window.l.current_scene.loaders.gtlf.loadAsync( './assets/models/union-platform3.glb');

        let amount = window.l.current_scene.fast ? 5 : 2.5;

        this.model.scene.traverse( function ( child ) {
    
            if ( child.isMesh ) {

                if ( child.material.name == 'Dark-Glass' ) {
                    child.material = new THREE.MeshStandardMaterial( { color: 0x9999ff, flatShading: true, metalness: 0.5, roughness: 0 } );
                } 
                if ( child.material.name == 'Red-Metal' ) {
                    child.material = new THREE.MeshStandardMaterial( { color: 0xAA0000, metalness: 0.1, roughness: 0.8 } );
                }
                if ( child.material.name == 'Metal' ) {
                    child.material = new THREE.MeshStandardMaterial( { color: 0x666666, metalness: 0.1, roughness: 0.9 } );
                }

                if ( child.material.name == 'Light-Metal' ) {
                    child.material = new THREE.MeshStandardMaterial( { color: 0x999999, metalness: 0.1, roughness: 0.9 } );
                }

                child.castShadow = true;

                child.original_material = child.material.clone();

                brightenMaterial(child.material, amount);

            }
    
        } );
        
        this.mesh = this.model.scene;
        this.mesh.scale.multiplyScalar(200);
        this.mesh.rotation.order = 'YXZ';
        this.ready = true;
    }

    // Runs on the main animation loop
    animate( delta ) {

    }

}
