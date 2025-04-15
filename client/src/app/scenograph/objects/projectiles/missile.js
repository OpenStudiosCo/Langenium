/**
 * Missile
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { proceduralBuilding, proceduralMetalMaterial2 } from '@/scenograph/materials.js';

export default class Extractor {

    // Array of active missiles on the scene
    active;

    // THREE.Mesh
    mesh;

    // The scale of the mesh.
    size;

    constructor() {
        this.ready = false;
        this.size = 10;

        // Setup active missile array.
        this.active = [];
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

        window.missile = {};
        window.missile.outer = material;

        this.mesh = new THREE.Object3D();
        this.mesh.userData.targetable = true;
        this.mesh.userData.objectClass = 'missiles';

        this.mesh.add(this.getMissileBody());

    }

    // getMissileHead
    // getMissileTail
    getMissileBody() {
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

        
    }

}
