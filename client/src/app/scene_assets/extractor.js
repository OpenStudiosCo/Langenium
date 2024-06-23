/**
 * Union Extractor
 * 
 * 
 */
import * as THREE from 'three';

import { proceduralBuilding, proceduralMetalMaterial2, proceduralSolarPanel } from '../materials.js';

export default class Extractor {

    // THREE.Planes for clipping this out of the water material.
    clippingPlanes;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {
        this.ready = false;
        this.size = 250;
    }

    async load() {

        const geometry = new THREE.CylinderGeometry( 5, 5, 5, 8, 1, true );
        //const material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1.0, side: THREE.DoubleSide} ); 

        const material = proceduralBuilding({
            uniforms: {
                time: 			    { value: 0.0 },
                scale:              { value: 1.3 },                                        // Scale
                lacunarity:         { value: 2.0 },                                         // Lacunarity
                randomness:         { value: 1.0 },                                       // Randomness
                diffuseColour1:     { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.40) },  // Diffuse gradient colour 1
                diffuseColour2:     { value: new THREE.Vector4( 0.5, 0.5, 0.5, 0.43) },     // Diffuse gradient colour 2
                diffuseColour3:     { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.44) },  // Diffuse gradient colour 3
                //emitColour1:        { value: new THREE.Vector4( 0.005, 0.051, 0.624, 0.25) },  // Emission gradient colour 1
                emitColour1:        { value: new THREE.Vector4( 0.0, 0.0, 0.0, 0.25) },  // Emission gradient colour 1
                emitColour2:        { value: new THREE.Vector4( 0.158, 1., 1., .9) },     // Emission gradient colour 2
            }
        });
        material.side = THREE.DoubleSide;

        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.scale.setScalar(this.size);

    }
}
