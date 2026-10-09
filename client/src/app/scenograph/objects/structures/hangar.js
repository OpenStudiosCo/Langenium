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

import HangarObject from '#/game/src/objects/structures/hangar';

export default class Hangar {

    // Modified materials for indoor scenes
    materials;

    // Game object containing layout definition and collision detection handling.
    objectClass;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {

        this.size = 5;

        this.materials = {};

        this.ready = false;

        this.objectClass = new HangarObject();

    }

    /**
     * Load hangar mesh
     * @returns
     */
    async loadMesh( ) {
        let hangarConfig, corridorConfig, quartersConfig;

        this.objectClass.design.components.forEach(component => {
            if ( component.name === 'Main Bay' ) {
                hangarConfig = component;
            }
            if ( component.name === 'Quarters' ) {
                quartersConfig = component;
            }
            if ( component.name === 'Corridor' ) {
                corridorConfig = component;
            }
        });

        /**
         * Main hangar mesh
         */
        let hangarMesh = await this.loadHangarMesh( hangarConfig );

        /**
         * Corridor mesh
         */
        let corridorMesh = await this.loadCorridorMesh( corridorConfig );
        corridorMesh.operation = ADDITION;
        hangarMesh.add( corridorMesh );

        /**
         * Player quarters mesh.
         */
        let quartersMesh = await this.loadQuartersMesh( quartersConfig );
        quartersMesh.operation = ADDITION;
        hangarMesh.add( quartersMesh );

        // Constructive Solid Geometry (csg) Evaluator.
        let csgEvaluator;
        csgEvaluator = new Evaluator();
        csgEvaluator.useGroups = true;
        let result = csgEvaluator.evaluateHierarchy( hangarMesh );

        let mesh = new THREE.Object3D();
        mesh.add( result );
        mesh.userData.targetable = false;
        mesh.userData.objectClass = 'hangar';
        mesh.scale.setScalar( 2.5 );

        return mesh;
    }

    async load() {

        // Setup materials.
        await this.loadMaterials();

        this.mesh = await this.loadMesh();

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
    async loadHangarMesh( config ) {
        /**
         * Hangar mesh
         */
        let hangarMesh = new Operation( new THREE.BoxGeometry( config.width, config.height, config.depth, 2, 2, 2 ), [
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
    async loadCorridorMesh( config ) {

        let corridorMesh = new Operation( new THREE.BoxGeometry( config.width, config.height, config.depth ), this.materials.metal );

        corridorMesh.position.x = config.position.x;
        corridorMesh.position.y = config.position.y;
        corridorMesh.position.z = config.position.z;
        corridorMesh.rotation.x = config.rotation.x;
        corridorMesh.rotation.y = config.rotation.y;
        corridorMesh.rotation.z = config.rotation.z;

        corridorMesh.updateMatrixWorld();

        return corridorMesh;
    }

    /**
     * Creates the player quarters mesh.
     */
    async loadQuartersMesh( config ) {
        let quartersMesh = new Operation( new THREE.BoxGeometry( config.width, config.height, config.depth, 2, 2, 2 ), this.materials.metal );

        quartersMesh.position.x = config.position.x;
        quartersMesh.position.y = config.position.y;
        quartersMesh.position.z = config.position.z;
        quartersMesh.rotation.x = config.rotation.x;
        quartersMesh.rotation.y = config.rotation.y;
        quartersMesh.rotation.z = config.rotation.z;
        quartersMesh.material.uniforms.scale.value = 0.8;

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
