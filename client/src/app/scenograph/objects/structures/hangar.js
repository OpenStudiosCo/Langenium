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
        this.size = 150;

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

        // let innerMesh = new Brush( new THREE.CylinderGeometry( 7.5, 7.5, 99, 8, 1, false ), material );
        // innerMesh.position.y = 1000;
        // innerMesh.scale.setScalar( this.size );
        // innerMesh.updateMatrixWorld();

        // let result = new THREE.Mesh(
        //     new THREE.BufferGeometry(),
        //     new THREE.MeshBasicMaterial()
        // );

        // // Constructive Solid Geometry (csg) Evaluator.
        // let csgEvaluator;
        // csgEvaluator = new Evaluator();
        // csgEvaluator.useGroups = true;
        // csgEvaluator.evaluate( outerMesh, innerMesh, HOLLOW_SUBTRACTION, result );
        // result.name = 'outer';

        // let innerMesh2 = new THREE.Mesh( new THREE.CylinderGeometry( 7.5, 7.5, 100, 8, 1, true ), material.clone() );
        // window.extractor.inner = innerMesh2.material;
        // innerMesh2.material.uniforms.scale.value = 0.8;
        // innerMesh2.position.y = 0;
        // innerMesh2.scale.setScalar( this.size );
        // innerMesh2.updateMatrixWorld();
        // innerMesh2.name = 'inner';

        this.mesh = new THREE.Object3D();
        this.mesh.add( outerMesh );
        // this.mesh.add( innerMesh2 );
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
