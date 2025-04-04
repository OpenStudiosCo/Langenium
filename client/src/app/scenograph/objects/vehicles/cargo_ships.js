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
import cargoShip from '../../../../../../game/src/actors/cargoShip';

export default class CargoShips {

    // THREE.Mesh clones
    instances;

    // Array of three.vector3's defining X/Z coordinates and radius of where extractors are in the ocean.
    locations;

    // THREE.Mesh
    mesh;

    // @instance YUKA.Path.
    path;

    // Boolean flag to indicate whether this class is done loading.
    ready;

    // The scale of the mesh.
    size;

    // Locations the cargo ships will randomly select and travel to.
    targets;

    constructor() {
        this.instances = [];
        this.ready = false;
        this.size = 1000;

        // Cargo ship start locations
        this.locations = [
            //new THREE.Vector3( 0, -500, this.size * 10 ),              // Test ship
            new THREE.Vector3( -35000, -2000, this.size * 10 ),
            new THREE.Vector3( -36000, -1500, this.size * 10 ),
            new THREE.Vector3( -34000, -1500, this.size * 10 ),
        ];

        // Cargo ship destinations, use the current scene's extractor positions.
        this.destinations = [];
        l.current_scene.objects.extractors.forEach( (extractor) => {
            this.destinations.push( new THREE.Vector3( extractor.position.x, 0, extractor.position.z ) );
        });

    }

    /**
     * Paths
     * 
     * @todo: Refactor into a common path setting and updating class.
     */
    getPath() {
        let path = new YUKA.Path();
        path.loop = true;

        // Add the union platform
        const platform_location = l.current_scene.objects.platform.mesh.position;
        path.add( new YUKA.Vector3( platform_location.x, 0, platform_location.z ) );

        this.destinations.forEach( ( destination ) => {
            path.add( new YUKA.Vector3( destination.x, 0, destination.z ) );
        });
        path.add( new YUKA.Vector3( platform_location.x, 0, platform_location.z ) );

        return path;
    }

    async getAll() {
        
        let path = this.getPath();

        const path_points = [];

        for ( let i = 0; i < path._waypoints.length; i ++ ) {

            const waypoint = path._waypoints[ i ];

            path_points.push( waypoint.x, waypoint.y, waypoint.z );

        }

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( path_points, 3 ) );

        const lineMaterial = new THREE.LineBasicMaterial( { color: 0xffff00 } );
        const lines = new THREE.LineLoop( lineGeometry, lineMaterial );

        this.pathLines = lines;

        /**
         * Load Meshes
         */

        await this.load();

        this.locations.forEach( async ( location, i ) => {
            
            let mesh = this.mesh.clone();
            mesh.userData.path = this.getPath();
            
            // Bump each starting point for the cargo ships
            for ( let j = 0; j < i; j++) {
                mesh.userData.path.advance();
            }

            mesh.position.copy( mesh.userData.path.current() );
            mesh.name = 'Cargo Ship #' + ( i + 1 );

            mesh.userData.objectClass = 'cargoShip';
            mesh.userData.targetable = true;
            mesh.userData.standing = 0;
            mesh.userData.size = this.size;
            mesh.userData.actor = new cargoShip( mesh );

            l.scenograph.entityManager.add( mesh.userData.actor.entity );

            mesh.matrixAutoUpdate = false;

            this.instances.push( mesh );
        } );

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
        result.name = 'outer';

        // Flip the object
        const scale = new THREE.Vector3(1, 1, -1);
        result.scale.multiply(scale);

        this.mesh = new THREE.Object3D();
        this.mesh.add( result );

    }

    animate() {

        l.current_scene.objects.cargo_ships.forEach( ( cargo_ship ) => {

            cargo_ship.userData.actor.animate();
            
        } );
 
    }
    
}
