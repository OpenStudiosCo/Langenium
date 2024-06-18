/**
 * Union Platform
 * 
 * 
 */
import * as THREE from 'three';

import { brightenMaterial, proceduralMetalMaterial } from '../materials.js';

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

                child.castShadow = true;

                child.original_material = child.material.clone();

                if ( child.material.name == 'Dark-Glass' ) {
                    child.material = new THREE.MeshStandardMaterial( { color: 0x9999ff, flatShading: true, metalness: 0.5, roughness: 0 } );
                    brightenMaterial(child.material, amount);
                } 
                if ( child.material.name == 'Red-Metal' ) {
                    child.material = new THREE.MeshStandardMaterial( { color: 0xAA0000, metalness: 0.1, roughness: 0.8 } );
                    brightenMaterial(child.material, amount);
                }
                if ( child.material.name == 'Metal' ) {
                    child.material = new THREE.MeshStandardMaterial( { color: 0x666666, metalness: 0.1, roughness: 0.9 } );
                    brightenMaterial(child.material, amount);
                }

                if ( child.material.name == 'Light-Metal' ) {
                    child.material = proceduralMetalMaterial({
                        uniforms: {
                            scale:      { value: 5.55 },   // Scale
                            lacunarity: { value: 2.0 },   // Lacunarity
                            randomness: { value: 0.0 },   // Randomness
                            emitColour: { value: new THREE.Color( 0x333333 )}   // Emission colour
                        }
                    });
                }

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
