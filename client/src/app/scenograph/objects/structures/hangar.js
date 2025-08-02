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

export default class Hangar {

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {
        this.ready = false;
        this.size = 5;

    }

    async load() {

        const clearMaterial = new THREE.MeshBasicMaterial( {color: 0xffFFFF, transparent: true, visible: false, side: THREE.DoubleSide} ); 
    
        const material = proceduralBuilding( {
            uniforms: {
                time        :  { value: 0.0 },
                scale       :  { value: .05 },                                         // Scale
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

        let outerMesh = new Brush( new THREE.BoxGeometry( 10, 5, 10, 2, 2, 2 ), material );
        outerMesh.scale.setScalar( this.size );
        outerMesh.updateMatrixWorld();

        let innerMesh = new Brush( new THREE.BoxGeometry( 9, 4, 9, 2, 2, 2 ), material );
        innerMesh.position.z = -10;
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

        let innerGeo = new THREE.BoxGeometry( 9, 4, 9, 2, 2, 2 );
        let innerMeshMaterial = material.clone();
        innerMeshMaterial.uniforms.scale.value = 0.25;

        let innerMesh2 = new THREE.Mesh( innerGeo, [
            innerMeshMaterial,
            innerMeshMaterial,
            innerMeshMaterial,
            innerMeshMaterial,
            innerMeshMaterial,
            clearMaterial.clone()
        ] );
        window.extractor.inner = innerMesh2.material;
        // innerMesh2.material.uniforms.scale.value = 0.8;
        innerMesh2.position.y = 0;
        innerMesh2.scale.setScalar( this.size );
        innerMesh2.updateMatrixWorld();
        innerMesh2.name = 'inner';

        this.mesh = new THREE.Object3D();
        this.mesh.add( result );
        this.mesh.add( innerMesh2 );
        this.mesh.userData.targetable = true;
        this.mesh.userData.objectClass = 'hangar';

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
