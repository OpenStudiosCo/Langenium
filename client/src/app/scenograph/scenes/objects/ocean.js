/**
 * Ocean plane
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import { Water } from '@/scenograph/materials/water.js';

export default class Ocean {
    // Configuration
    uniforms;

    // THREE.Water
    water;

    // The sky mesh.
    mesh;

    constructor( submergedObjects ) {

        const waterGeometry = new THREE.PlaneGeometry( l.scale * 2, l.scale * 2, 50, 50 );

        this.water = new Water(
            waterGeometry,
            {
                textureWidth :  512,
                textureHeight:  512,
                waterNormals :  new THREE.TextureLoader().load( './assets/textures/waternormals.jpg', function ( texture ) {

                    texture.wrapS    =    texture.wrapT    =    THREE.RepeatWrapping;

                } ),
                sunDirection   :  new THREE.Vector3(),
                sunColor       :  0xffffff,
                waterColor     :  0x0066DD,
                distortionScale:  20.0,
                side           :  THREE.FrontSide,
                // Submerged objects that need transparency where they are located
                // Coordinates have to be pre-entered before shader compilation due to GLSL being inflexible with array sizes
                submergedObjects:  submergedObjects
            }
        );

        this.water.material.transparent = true;

        // this.water.material = new THREE.MeshBasicMaterial( {
        //     alphaMap: new THREE.TextureLoader().load( './assets/textures/test.png'),
        //     color: 0x0000ff,
        //     side: THREE.DoubleSide,
        //     transparent: true,
        // } );
        this.water.rotation.x = - Math.PI / 2;

        this.water.name = 'Ocean';

    }

    animate( currentTime ) {
        // Iterate the sky uniforms to animate it.
        l.current_scene.objects.ocean.water.material.uniforms.time.value += 1.0 / 60;
    }

}
