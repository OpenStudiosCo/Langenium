/**
 * Sky 2
 * 
 * Uses Three.JS Sky, based on https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html
 */
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';


export default class Sky2 {
    sky;

    sun;

    settings;

    constructor() {

        this.settings = {
            turbidity: 4.5,
            rayleigh: 0.0657,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 84,
            azimuth: 180,
            exposure: 0.1084
        };

        // Add Sky
        this.sky = new Sky();
        this.sky.scale.setScalar( l.scale * 2 );

 
        this.sun = new THREE.Vector3();

    }

    updateSettings() {
        console.log(this.sky.material.uniforms);
        for (const [key, value] of Object.entries(this.settings)) {
            if ( ! this.sky.material.uniforms[ key ] ) {
                this.sky.material.uniforms[ key ] = { value: false };
            }
            this.sky.material.uniforms[ key ].value = this.settings[ key ];
            console.log(this.sky.material.uniforms[ key ].value, this.settings[ key ]);
        }

        const phi = THREE.MathUtils.degToRad( 90 - this.settings.elevation );
        const theta = THREE.MathUtils.degToRad( this.settings.azimuth );

        this.sun.setFromSphericalCoords( 1, phi, theta );

        this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.sun );

    }


    animate( delta ) {
        // Iterate the sky uniforms to animate it.
        
    }

}
