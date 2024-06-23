/**
 * Ocean plane
 */
import * as THREE from 'three';
import { Water } from '../materials/water.js';

export default class Ocean {
    // Configuration
    uniforms;

    // THREE.Water
    water;

    // The sky mesh.
    mesh;

    constructor() {

        const waterGeometry = new THREE.PlaneGeometry( window.l.scale * 2, window.l.scale * 2, 50, 50 );

        this.water = new Water(
            waterGeometry,
            {
                clipBias: 0.003,
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load( './assets/textures/waternormals.jpg', function ( texture ) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                } ),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x0066DD,
                distortionScale: 20.0,
                side: THREE.DoubleSide,
                clipping: true
            }
        );
        
        this.water.material = new THREE.MeshPhongMaterial( {
            alphaToCoverage: true,
            color: 0x0000ff,
            side: THREE.DoubleSide,
            clipping: true,
            clippingPlanes: [],  // Set to an empty array initially
            clipShadows: true,
            clipIntersection: false
        } );
        this.water.rotation.x = - Math.PI / 2;

    }

    animate( delta ) {
        // Iterate the sky uniforms to animate it.
        //window.l.current_scene.scene_objects.ocean.water.material.uniforms.time.value += 1.0 / 60;
    }
    
}
