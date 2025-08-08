/**
 * Hangar (Player quarters)
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';
import { ADDITION, HOLLOW_SUBTRACTION, Operation, Evaluator } from 'three-bvh-csg';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { proceduralBuilding, proceduralMetalMaterial2 } from '@/scenograph/materials.js';

export default class Hangar {

    // The hangar mesh and root of the CSG BVH hierarchy.
    hangar;

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

        this.size = 5;

        this.materials = {};

        let corridorScale = 0.125;
        // Based on office door dimensions.
        this.corridorSize = {
            width: 8.2 * corridorScale,
            height: 20.4 * corridorScale,
            depth: 20 * corridorScale,
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
        

    }

    async load() {

        // Setup materials.
        await this.loadMaterials();

        this.hangar = await this.loadHangarMesh();
        
        /**
         * Corridor mesh
         */
        let corridorMesh = await this.loadCorridorMesh();
        corridorMesh.operation = ADDITION;
        this.hangar.add( corridorMesh );

        /**
         * Player quarters mesh.
         */
        let quartersMesh = await this.loadQuartersMesh();
        quartersMesh.operation = ADDITION;
        this.hangar.add( quartersMesh );

        // Constructive Solid Geometry (csg) Evaluator.
        let csgEvaluator;
        csgEvaluator = new Evaluator();
        csgEvaluator.useGroups = true;
        let result = csgEvaluator.evaluateHierarchy( this.hangar );

        this.mesh = new THREE.Object3D();
        this.mesh.add( result );
        this.mesh.userData.targetable = false;
        this.mesh.userData.objectClass = 'hangar';
        this.mesh.scale.setScalar( 2.5 );

    }

    /**
     * Setup Hangar materials
     */
    async loadMaterials() {      
        this.materials.clear = new THREE.MeshBasicMaterial( { color: 0xffFFFF, transparent: true, visible: false, side: THREE.DoubleSide } );
        this.materials.metal = proceduralBuilding( {
            uniforms: {
                time: { value: 0.0 },
                scale: { value: .025 },                                         // Scale
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
    }

    /**
     * Creates the Hangar's main mesh.
     */
    async loadHangarMesh() {
        /**
         * Hangar mesh
         */
        let hangarMesh = new Operation( new THREE.BoxGeometry( this.hangarSize.width, this.hangarSize.height, this.hangarSize.depth, 2, 2, 2 ), [
            this.materials.hangar,
            this.materials.hangar,
            this.materials.hangar,
            this.materials.hangar,
            this.materials.hangar,
            this.materials.clear.clone()
        ] );

        hangarMesh.updateMatrixWorld();

        return hangarMesh;
    }

    /**
     * Creates the corridor mesh.
     */
    async loadCorridorMesh() {
        
        var doorGeometry = new THREE.BoxGeometry( this.corridorSize.width, this.corridorSize.height, this.corridorSize.depth );

        let corridorMesh = new Operation( doorGeometry, this.materials.metal );

        corridorMesh.position.x = - ( this.hangarSize.width * this.size ) / 10;
        corridorMesh.position.y = ( - ( this.hangarSize.height * this.size ) / 10 ) + this.corridorSize.height * 0.5;
        corridorMesh.rotation.y = Math.PI / 2;

        corridorMesh.position.z = ( - ( this.hangarSize.depth * this.size ) / 10 ) / 4;

        corridorMesh.updateMatrixWorld();

        return corridorMesh;
    }

    /**
     * Creates the player quarters mesh.
     */
    async loadQuartersMesh() {
        let innerGeo = new THREE.BoxGeometry( this.quartersSize.width, this.quartersSize.height, this.quartersSize.depth, 2, 2, 2 );
        let quartersMesh = new Operation( innerGeo, this.materials.metal );

        window.quarters = quartersMesh;

        quartersMesh.material.uniforms.scale.value = 0.8;
        // Offset player quarters by the hangars half width
        quartersMesh.position.x = ( - ( this.hangarSize.width * this.size ) / 10 );
        // Offset player quarters by the access corridor
        quartersMesh.position.x += - this.corridorSize.depth * 0.75;
        // Offset player quarters by half the quarters width
        quartersMesh.position.x += ( - ( this.quartersSize.width * this.size ) / 10 );
        // Offset for intersection
        quartersMesh.position.x += 1;

        quartersMesh.position.y = ( - ( this.quartersSize.height * this.size ) / 10 );

        quartersMesh.position.z = ( - ( this.hangarSize.depth * this.size ) / 10 ) / 2;

        quartersMesh.updateMatrixWorld();
        quartersMesh.name = 'inner';

        return quartersMesh;
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
        l.current_scene.objects.hangar.materials.metal.uniforms.time.value += 0.0000025;
    }

}
