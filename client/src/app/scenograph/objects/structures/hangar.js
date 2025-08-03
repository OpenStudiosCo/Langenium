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

    // Dimensions of player living quarters
    // @todo: Dynamic hangars which don't all have one.
    quartersSize;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {

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

        let innerMeshMaterial = material.clone();
        innerMeshMaterial.uniforms.scale.value = 0.25;


        let outerMesh = new Brush( new THREE.BoxGeometry( this.hangarSize.width, this.hangarSize.height, this.hangarSize.depth, 2, 2, 2 ), [
            innerMeshMaterial,
            innerMeshMaterial,
            innerMeshMaterial,
            innerMeshMaterial,
            innerMeshMaterial,
            clearMaterial.clone()
        ]  );
        outerMesh.scale.setScalar( this.size );
        outerMesh.updateMatrixWorld();

        // Create door geometry
        var doorWidth = 8.2;
        var doorHeight = 20.4;
        var doorDepth = 20;
        var doorGeometry = new THREE.BoxGeometry( doorWidth, doorHeight, doorDepth );

        let innerMesh = new Brush( doorGeometry, material );
        innerMesh.position.x = - (this.hangarSize.width * this.size) / 2 ;
        innerMesh.position.y = ( - (this.hangarSize.height * this.size) / 2 ) + doorHeight * 0.25;
        innerMesh.rotation.y = Math.PI / 2;
        innerMesh.scale.setScalar( this.size / 10 );
        innerMesh.updateMatrixWorld();

        window.hangarDoor = innerMesh;

        let result = new THREE.Mesh(
            new THREE.BufferGeometry(),
            new THREE.MeshBasicMaterial()
        );

        // Constructive Solid Geometry (csg) Evaluator.
        let csgEvaluator;
        csgEvaluator = new Evaluator();
        csgEvaluator.useGroups = true;
        csgEvaluator.evaluate( innerMesh, outerMesh, ADDITION, result );
        result.name = 'outer';

        let innerGeo = new THREE.BoxGeometry( this.quartersSize.width, this.quartersSize.height, this.quartersSize.depth, 2, 2, 2 );

        let innerMesh2 = new Brush( innerGeo, material );
        window.quarters = innerMesh2;
        innerMesh2.material.uniforms.scale.value = 0.8;
        // Offset player quarters by the hangars half width
        innerMesh2.position.x = (- (this.hangarSize.width * this.size) / 2);
        // Offset player quarters by the access corridor
        innerMesh2.position.x += - doorDepth * 0.25;
        // Offset player quarters by half the quarters width
        innerMesh2.position.x += (- (this.quartersSize.width * this.size) / 2);
        // Offset for intersection
        innerMesh2.position.x += 1;

        innerMesh2.position.y = ( - (this.quartersSize.height * this.size) / 2 );

        innerMesh2.scale.setScalar( this.size );
        innerMesh2.updateMatrixWorld();
        innerMesh2.name = 'inner';

        csgEvaluator.evaluate( result, innerMesh2, ADDITION, result );

        this.mesh = new THREE.Object3D();
        this.mesh.add( result );
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
