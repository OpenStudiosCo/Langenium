/**
 * Cargo Ships loader
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';
import * as YUKA from 'yuka';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { proceduralMetalMaterial } from '@/scenograph/materials.js';
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';

export default class CargoShips {

    // Array of three.vector3's defining X/Z coordinates and radius of where extractors are in the ocean.
    locations;

    // THREE.Mesh
    mesh;

    // @instance YUKA.Path.
    path;

    // The scale of the mesh.
    size;

    // Locations the cargo ships will randomly select and travel to.
    targets;

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

        this.path = new YUKA.Path();
        this.path.loop = true;
    }

    async getAll() {
        /**
         * Paths
         */
        // Add the union platform
        const platform_location = l.current_scene.scene_objects.platform.mesh.position;
        this.path.add( new YUKA.Vector3( platform_location.x, 0, platform_location.z ) );

        l.current_scene.scene_objects.extractors.forEach( (extractor) => {
            this.path.add( new YUKA.Vector3( extractor.position.x, 0, extractor.position.z ) );
            this.path.add( new YUKA.Vector3( platform_location.x, 0, platform_location.z ) );
        });

        /**
         * Load Meshes
         */
        let meshes = [];

        await this.load();

        this.locations.forEach( async ( location, i ) => {
            let mesh = this.mesh.clone();

            mesh.position.x = location.x;
            mesh.position.z = location.y;
            mesh.name = 'Cargo Ship #' + ( i + 1 );

            mesh.userData.vehicle = new YUKA.Vehicle();
            mesh.userData.vehicle.position.z = mesh.position.z;
            mesh.userData.vehicle.position.x = mesh.position.x;
            mesh.userData.vehicle.maxSpeed = 15000;
            mesh.userData.vehicle.boundingRadius = 2000;
            mesh.userData.vehicle.setRenderComponent( mesh, this.sync );
            //mesh.userData.vehicle.smoother = new YUKA.Smoother( 20 );

            l.scenograph.entityManager.add( mesh.userData.vehicle );

            const followPathBehavior = new YUKA.FollowPathBehavior( this.path );
            mesh.userData.vehicle.steering.add( followPathBehavior );
            // const wanderBehavior = new YUKA.WanderBehavior();
            // mesh.userData.vehicle.steering.add( wanderBehavior );

            mesh.matrixAutoUpdate = false;

            meshes.push( mesh );
        } );

        return meshes;
    }

    async load() {

        //const material = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 1.0, side: THREE.DoubleSide} );

        const material = proceduralMetalMaterial( {
            uniforms: {
                scale         :  { value: 0.025 },                                           // Scale
                lacunarity    :  { value: 2.0 },                                             // Lacunarity
                randomness    :  { value: 1.0 },                                             // Randomness
                diffuseColour1:  { value: new THREE.Vector4( 0.2, 0.2, 0.2, 0.40 ) },        // Diffuse gradient colour 1
                diffuseColour2:  { value: new THREE.Vector4( 0.5, 0.5, 0.5, 0.43 ) },        // Diffuse gradient colour 2
                diffuseColour3:  { value: new THREE.Vector4( 0.2, 0.2, 0.2, 0.44 ) },        // Diffuse gradient colour 3
                emitColour1   :  { value: new THREE.Vector4( 0.02, 0.02, 0.02, 0.61 ) },     // Emission gradient colour 1
                emitColour2   :  { value: new THREE.Vector4( 1.0, 1.0, 0.5, 0.63 ) },        // Emission gradient colour 2
            }
        } );

        let outerMesh = new Brush( new THREE.TetrahedronGeometry( 1, 0 ), material );
        outerMesh.rotation.x = -0.1;
        outerMesh.rotation.y = Math.PI;
        outerMesh.rotation.z = Math.PI / 4;
        outerMesh.scale.set( this.size / 4, this.size / 4, this.size );
        outerMesh.updateMatrixWorld();

        let innerMesh = new Brush( new THREE.TetrahedronGeometry( 1, 0 ), material );
        innerMesh.rotation.x = -0.1;
        innerMesh.rotation.y = Math.PI;
        innerMesh.rotation.z = Math.PI / 4;
        innerMesh.position.z = this.size / 1.5;
        innerMesh.scale.set( this.size / 4, this.size / 4, this.size );
        innerMesh.updateMatrixWorld();

        let result = new THREE.Mesh(
            new THREE.BufferGeometry(),
            new THREE.MeshBasicMaterial()
        );

        // Constructive Solid Geometry (csg) Evaluator.
        let csgEvaluator;
        csgEvaluator = new Evaluator();
        csgEvaluator.useGroups = true;
        csgEvaluator.evaluate( outerMesh, innerMesh, SUBTRACTION, result );
        result.receiveShadow = true;
        result.layers.set( 11 );
        result.name = 'outer';

        // Flip the object
        const scale = new THREE.Vector3(1, 1, -1);
        result.scale.multiply(scale);

        this.mesh = new THREE.Object3D();
        this.mesh.add( result );

    }
    sync( entity, renderComponent ) {

        renderComponent.matrix.copy( entity.worldMatrix );
    
    }
    
    
}
