/**
 * Union Extractor
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';
import { HOLLOW_SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { proceduralBuilding, proceduralMetalMaterial2 } from '@/scenograph/materials.js';

export default class Extractor {

    // Array of three.vector3's defining X/Z coordinates and radius of where extractors are in the ocean.
    extractorLocations;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {
        this.ready = false;
        this.size = 150;

        // Setup extractors
        this.extractorLocations = [
            //new THREE.Vector3( 0, 0, this.size * 10 ),            // Test extractor.
            new THREE.Vector3( 0, -70000, this.size * 10 ),
            new THREE.Vector3( 0, 70000, this.size * 10 ),
            new THREE.Vector3( -70000, 0, this.size * 10 ),
            new THREE.Vector3( 70000, 0, this.size * 10 ),
        ];
    }

    async getAll() {
        let extractors = [];

        await this.load();

        this.extractorLocations.forEach( async ( extractor_location, i ) => {
            let extractor = this.mesh.clone();

            extractor.rotation.y = Math.PI / 8;
            extractor.position.x = extractor_location.x;
            extractor.position.y = -7450;
            extractor.position.z = extractor_location.y;

            extractor.name = 'Extractor #' + ( i + 1 );

            extractors.push( extractor );
        } );

        return extractors;
    }

    async load() {

        //const material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1.0, side: THREE.DoubleSide} ); 

        const material = proceduralBuilding( {
            uniforms: {
                time        :  { value: 0.0 },
                scale       :  { value: .005 },                                         // Scale
                lacunarity  :  { value: 2.0 },                                          // Lacunarity
                randomness  :  { value: 1.0 },                                          // Randomness
                emitColour1 :  { value: new THREE.Vector4( 0.0, 0.0, 0.0, 0.25 ) },     // Emission gradient colour 1
                emitColour2 :  { value: new THREE.Vector4( 0.158, 1., 1., .9 ) },       // Emission gradient colour 2
                shadowFactor:  { value: 0.03 },
                shadowOffset:  { value: 0.1 },
            }
        } );

        material.transparent = true;
        material.side = THREE.DoubleSide;

        window.extractor = {};
        window.extractor.outer = material;

        let outerMesh = new Brush( new THREE.CylinderGeometry( 8, 8, 100, 8, 1, false ), material );
        outerMesh.scale.setScalar( this.size );
        outerMesh.updateMatrixWorld();

        let innerMesh = new Brush( new THREE.CylinderGeometry( 7.5, 7.5, 99, 8, 1, false ), material );
        innerMesh.position.y = 1000;
        innerMesh.scale.setScalar( this.size );
        innerMesh.updateMatrixWorld();

        let result = new THREE.Mesh(
            new THREE.BufferGeometry(),
            new THREE.MeshBasicMaterial()
        );

        // Constructive Solid Geometry (csg) Evaluator.
        let csgEvaluator;
        csgEvaluator = new Evaluator();
        csgEvaluator.useGroups = true;
        csgEvaluator.evaluate( outerMesh, innerMesh, HOLLOW_SUBTRACTION, result );
        result.name = 'outer';

        let innerMesh2 = new THREE.Mesh( new THREE.CylinderGeometry( 7.5, 7.5, 100, 8, 1, true ), material.clone() );
        window.extractor.inner = innerMesh2.material;
        innerMesh2.material.uniforms.scale.value = 0.8;
        innerMesh2.position.y = 0;
        innerMesh2.scale.setScalar( this.size );
        innerMesh2.updateMatrixWorld();
        innerMesh2.name = 'inner';

        this.mesh = new THREE.Object3D();
        this.mesh.add( result );
        this.mesh.add( innerMesh2 );
        this.mesh.userData.targetable = true;
        this.mesh.userData.objectClass = 'extractors';

        // Storage tanks.
        // this.mesh.add(this.getStorageTanks());

        // let phatTank = this.getPhatTank();
        // phatTank.position.y = -2500;
        // phatTank.position.x = 200;
        // this.mesh.add(phatTank);

    }

    getPhatTank() {
        const geometry = new THREE.SphereGeometry( 3, 32, 16 );
        // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
        const material = proceduralMetalMaterial2( {
            uniforms: {
                scale         :  { value: 1.5 },                                             // Scale
                lacunarity    :  { value: 2.0 },                                             // Lacunarity
                randomness    :  { value: .5 },                                              // Randomness
            }
        } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.scale.setScalar( 150 );
        return sphere;
    }

    getStorageTanks() {
        const offset = 250;
        const tankArray = [
            { x: -offset * 2, z: 0.00 },
            { x: -offset * 2, z: offset },
            { x: -offset * 2, z: offset * 2 },
            { x: -offset * 2, z: offset * 3 },
            { x: -offset * 1.0, z: 0.00 },
            { x: -offset * 1.0, z: offset },
            { x: -offset * 1.0, z: offset * 2 },
            { x: -offset * 1.0, z: offset * 3 },
        ];

        let tankMeshes = new THREE.Object3D();

        tankArray.forEach( ( coord, i ) => {
            let tank = this.getStorageTank();
            tank.position.x = coord.x - offset;
            tank.position.z = coord.z - offset * 1.5;
            tank.rotation.y = i;
            tankMeshes.add( tank );
        } );

        tankMeshes.position.y = -100;
        return tankMeshes;
    }

    getStorageTank() {
        const geometry = new THREE.CapsuleGeometry( 1, 40, 8, 16 );
        // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        const material = proceduralMetalMaterial2( {
            uniforms: {
                scale         :  { value: .75 },                                             // Scale
                lacunarity    :  { value: 2.0 },                                             // Lacunarity
                randomness    :  { value: .5 },                                              // Randomness
            }
        } );
        const capsule = new THREE.Mesh( geometry, material );
        capsule.scale.setScalar( 100 );

        return capsule;
    }

    animate( currentTime ) {

        l.current_scene.objects.extractors.forEach( ( extractor, i ) => {
            let inner = extractor.getObjectByName( 'inner' );
            let outer = extractor.getObjectByName( 'outer' );
            inner.material.uniforms.time.value += 0.0000025;
            outer.material[ 0 ].uniforms.time.value += 0.0000025;
        } );
    }

}
