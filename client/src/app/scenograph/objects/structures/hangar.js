/**
 * Union Extractor
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';
import { ADDITION, HOLLOW_SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { proceduralBuilding, proceduralMetalMaterial2 } from '@/scenograph/materials.js';

export default class Hangar {

    // Dimensions of the hangar
    // @todo: Dynamic hangars with different dimensions
    hangarSize;

    materials;

    // Dimensions of player living quarters
    // @todo: Dynamic hangars which don't all have one.
    quartersSize;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {

        this.materials = {};

        // Based on office door dimensions.
        this.corridorSize = {
            width: 8.2,
            height: 20.4,
            depth: 20,
        }

        this.hangarSize = {
            width: 10,
            height: 5,
            depth: 10
        };

        this.quartersSize = {
            width: 5,
            height: 2.5,
            depth: 5
        };

        this.ready = false;
        this.size = 5;

    }

    async load() {

        /**
         * Setup Hangar materials
         */

        this.materials.clear = new THREE.MeshBasicMaterial( { color: 0xffFFFF, transparent: true, visible: false, side: THREE.DoubleSide } );
        this.materials.metal = proceduralBuilding( {
            uniforms: {
                time: { value: 0.0 },
                scale: { value: .05 },                                         // Scale
                lacunarity: { value: 2.0 },                                          // Lacunarity
                randomness: { value: 1.0 },                                          // Randomness
                emitColour1: { value: new THREE.Vector4( 0.0, 0.0, 0.0, 0.25 ) },     // Emission gradient colour 1
                emitColour2: { value: new THREE.Vector4( 0.158, 1., 1., .9 ) },       // Emission gradient colour 2
                shadowFactor: { value: 0.03 },
                shadowOffset: { value: 0.1 },
            }
        } );
        this.materials.metal.transparent = true;
        this.materials.metal.side = THREE.DoubleSide;
        // Clone of the material to customize scaling.
        this.materials.hangar = this.materials.metal.clone();
        this.materials.hangar.uniforms.scale.value = 0.25;

        let hangarMesh = await this.loadHangarMesh();

        
        /**
         * Corridor mesh
         */
        let corridorMesh = await this.loadCorridorMesh();

        // Setup the result mesh.
        let result = new THREE.Mesh( new THREE.BufferGeometry(), new THREE.MeshBasicMaterial() );

        // Constructive Solid Geometry (csg) Evaluator.
        let csgEvaluator;
        csgEvaluator = new Evaluator();
        csgEvaluator.useGroups = true;
        csgEvaluator.evaluate( corridorMesh, hangarMesh, ADDITION, result );
        result.name = 'outer';

        let innerGeo = new THREE.BoxGeometry( this.quartersSize.width, this.quartersSize.height, this.quartersSize.depth, 2, 2, 2 );

        /**
         * Player quarters mesh.
         */
        let quartersMesh = new Brush( innerGeo, this.materials.metal );
        window.quarters = quartersMesh;
        quartersMesh.material.uniforms.scale.value = 0.8;
        // Offset player quarters by the hangars half width
        quartersMesh.position.x = ( - ( this.hangarSize.width * this.size ) / 2 );
        // Offset player quarters by the access corridor
        quartersMesh.position.x += - this.corridorSize.depth * 0.25;
        // Offset player quarters by half the quarters width
        quartersMesh.position.x += ( - ( this.quartersSize.width * this.size ) / 2 );
        // Offset for intersection
        quartersMesh.position.x += 1;

        quartersMesh.position.y = ( - ( this.quartersSize.height * this.size ) / 2 );

        quartersMesh.scale.setScalar( this.size );
        quartersMesh.updateMatrixWorld();
        quartersMesh.name = 'inner';

        // @todo: #31 - Implement hierarchical operations
        // csgEvaluator.evaluate( result, innerMesh2, ADDITION, result );

        this.mesh = new THREE.Object3D();
        this.mesh.add( result );
        // this.mesh.add( innerMesh2 );
        this.mesh.userData.targetable = false;
        this.mesh.userData.objectClass = 'hangar';

    }

    /**
     * Creates the Hangar's main mesh.
     */
    async loadHangarMesh() {
        /**
         * Hangar mesh
         */
        let hangarMesh = new Brush( new THREE.BoxGeometry( this.hangarSize.width, this.hangarSize.height, this.hangarSize.depth, 2, 2, 2 ), [
            this.materials.hangar,
            this.materials.hangar,
            this.materials.hangar,
            this.materials.hangar,
            this.materials.hangar,
            this.materials.clear.clone()
        ] );

        hangarMesh.scale.setScalar( this.size );

        hangarMesh.updateMatrixWorld();

        return hangarMesh;
    }

    /**
     * Creates the corridor mesh.
     */
    async loadCorridorMesh() {
        
        var doorGeometry = new THREE.BoxGeometry( this.corridorSize.width, this.corridorSize.height, this.corridorSize.depth );

        let corridorMesh = new Brush( doorGeometry, this.materials.metal );

        corridorMesh.position.x = - ( this.hangarSize.width * this.size ) / 2;
        corridorMesh.position.y = ( - ( this.hangarSize.height * this.size ) / 2 ) + this.corridorSize.height * 0.25;
        corridorMesh.rotation.y = Math.PI / 2;

        corridorMesh.scale.setScalar( this.size / 10 );

        corridorMesh.updateMatrixWorld();

        return corridorMesh;
    }

    /**
     * Animate hook.
     * 
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     * 
     * @method animate
     * @memberof Hangar
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate( currentTime ) {

    }

}
