/**
 * Cargo Ships loader
 */
import * as THREE from 'three';

import {brightenMaterial, proceduralMetalMaterial} from '../materials.js';
import { SUBTRACTION    , Brush, Evaluator } from 'three-bvh-csg';

export default class CargoShips {
    
    // Array of three.vector3's defining X/Z coordinates and radius of where extractors are in the ocean.
    locations;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {
        this.ready = false;
        this.size = 1000;

        // Setup extractors
        this.locations = [
            //new THREE.Vector3( 0, -500, this.size * 10 ),              // Test ship
            new THREE.Vector3( -35000, -2000, this.size * 10 ),
            new THREE.Vector3( -36000, -1500, this.size * 10 ),
            new THREE.Vector3( -34000, -1500, this.size * 10 ),
        ];
    }

    async getAll() {
        let meshes = [];

        await this.load();

        this.locations.forEach( async ( location, i ) => {
            let mesh = this.mesh.clone();
        
            mesh.position.x = location.x;
            mesh.position.z = location.y;
            
            meshes.push( mesh );
        });

        return meshes;
    }

    async load() {

        //const material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1.0, side: THREE.DoubleSide} );

        const material = proceduralMetalMaterial({
            uniforms: {
                scale:              { value: 0.025 },                       // Scale
                lacunarity:         { value: 2.0 },                         // Lacunarity
                randomness:         { value: 1.0 },                         // Randomness
                diffuseColour1:     { value: new THREE.Vector4( 0.2, 0.2, 0.2, 0.40) },  // Diffuse gradient colour 1
                diffuseColour2:     { value: new THREE.Vector4( 0.5, 0.5, 0.5, 0.43) },     // Diffuse gradient colour 2
                diffuseColour3:     { value: new THREE.Vector4( 0.2, 0.2, 0.2, 0.44) },  // Diffuse gradient colour 3
                emitColour1:        { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.61) },  // Emission gradient colour 1
                emitColour2:        { value: new THREE.Vector4( 1.0, 1.0, 0.5, 0.63) },     // Emission gradient colour 2
            }
        });

        let outerMesh = new Brush( new THREE.TetrahedronGeometry( 1, 0 ), material );
        outerMesh.rotation.x = -0.1;
        outerMesh.rotation.y = Math.PI ;
        outerMesh.rotation.z = Math.PI / 4;
        outerMesh.scale.set(this.size / 4, this.size / 4, this.size);
        outerMesh.updateMatrixWorld();

        let innerMesh = new Brush( new THREE.TetrahedronGeometry( 1, 0 ), material );
        innerMesh.rotation.x = -0.1;
        innerMesh.rotation.y = Math.PI ;
        innerMesh.rotation.z = Math.PI / 4;
        innerMesh.position.z = this.size / 1.5;
        innerMesh.scale.set(this.size / 4, this.size / 4, this.size);
        innerMesh.updateMatrixWorld();

        let result = new THREE.Mesh(
            new THREE.BufferGeometry(),
            new THREE.MeshBasicMaterial()
          );
        
        // Constructive Solid Geometry (csg) Evaluator.
        let csgEvaluator;
        csgEvaluator = new Evaluator();
        csgEvaluator.useGroups = true;
        csgEvaluator.evaluate(outerMesh, innerMesh, SUBTRACTION    , result);
        result.receiveShadow = true;
        result.layers.set(11);
        result.name = 'outer';

        this.mesh = new THREE.Object3D();
        this.mesh.add(result);

    }
}
