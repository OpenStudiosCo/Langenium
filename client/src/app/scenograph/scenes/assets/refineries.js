/**
 * Cargo Ships loader
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { proceduralMetalMaterial2, proceduralBuilding } from '@/scenograph/materials.js';
import { Brush, Evaluator, INTERSECTION } from 'three-bvh-csg';

export default class Refineries {

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
            //new THREE.Vector3( 0, -2000, this.size * 10 ),              // Test refinery
            new THREE.Vector3( 20000, -20000, this.size * 10 ),
            new THREE.Vector3( -20000, 20000, this.size * 10 ),
        ];
    }

    async getAll() {
        let meshes = [];

        await this.load();

        this.locations.forEach( async ( location, i ) => {
            let mesh = this.mesh.clone();

            mesh.position.x = location.x;
            mesh.position.y = this.size / 6.5;
            mesh.position.z = location.y;
            mesh.name = 'Refinery #' + ( i + 1 );

            meshes.push( mesh );
        } );

        return meshes;
    }

    async load() {

        //const material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1.0, side: THREE.DoubleSide} );

        const material = proceduralMetalMaterial2( {
            uniforms: {
                scale     :  { value: .055 },     // Scale
                lacunarity:  { value: 2.0 },      // Lacunarity
                randomness:  { value: 1. },       // Randomness
            }
        } );

        let slice1 = this.getSlice( 0, material );
        let slice2 = this.getSlice( 200, material );
        let slice3 = this.getSlice( 400, material );
        let slice4 = this.getSlice( 600, material );

        this.mesh = new THREE.Object3D();
        this.mesh.add( slice1 );
        this.mesh.add( slice2 );
        this.mesh.add( slice3 );
        this.mesh.add( slice4 );

        const material2 = proceduralBuilding( {
            uniforms: {
                time        :  { value: 0.0 },
                scale       :  { value: 13.3 },                                         // Scale
                lacunarity  :  { value: 2.0 },                                          // Lacunarity
                randomness  :  { value: 1.0 },                                          // Randomness
                emitColour1 :  { value: new THREE.Vector4( 0.0, 0.0, 0.0, 0.25 ) },     // Emission gradient colour 1
                emitColour2 :  { value: new THREE.Vector4( 0.158, 1., 1., .9 ) },       // Emission gradient colour 2
                shadowFactor:  { value: 0.01 },
                shadowOffset:  { value: 1.75 },
            }
        } );

        let innerShell = new Brush( new THREE.OctahedronGeometry( 1, 0 ), material2 );
        innerShell.rotation.x = - Math.PI / 2;
        innerShell.rotation.y = Math.PI;
        innerShell.rotation.z = Math.PI / 4;
        innerShell.scale.set( this.size * 0.95, this.size * 0.95, this.size / 1.5 * 0.95 );
        innerShell.updateMatrixWorld();
        innerShell.name = 'inner';
        this.mesh.add( innerShell );

    }

    getSlice( position_y, material ) {
        let outerShell = new Brush( new THREE.OctahedronGeometry( 1, 0 ), material );
        outerShell.rotation.x = - Math.PI / 2;
        outerShell.rotation.y = Math.PI;
        outerShell.rotation.z = Math.PI / 4;
        outerShell.scale.set( this.size, this.size, this.size / 1.5 );
        outerShell.updateMatrixWorld();

        let horizontalSlice = new Brush( new THREE.BoxGeometry( 1, 1, 1 ), material );
        horizontalSlice.scale.set( this.size * 2, this.size / 6, this.size * 2 );
        horizontalSlice.position.y = position_y;
        horizontalSlice.updateMatrixWorld();

        let result = new THREE.Mesh(
            new THREE.BufferGeometry(),
            new THREE.MeshBasicMaterial()
        );

        // Constructive Solid Geometry (csg) Evaluator.
        let csgEvaluator;
        csgEvaluator = new Evaluator();
        csgEvaluator.useGroups = false;
        csgEvaluator.evaluate( outerShell, horizontalSlice, INTERSECTION, result );

        result.receiveShadow = true;
        result.layers.set( 11 );

        return result;
    }

    animate( delta ) {

        l.current_scene.scene_objects.refineries.forEach( ( refinery, i ) => {
            let inner = refinery.getObjectByName( 'inner' );
            inner.material.uniforms.time.value += 0.00005;
        } );
    }
}
