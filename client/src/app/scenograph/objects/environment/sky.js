/**
 * Sky sphere
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class Sky {
    // Configuration
    uniforms;

    // Image Texture
    noiseTexture2;

    // The sky mesh.
    mesh;

    constructor() {

        // todo: Make this reusable.
        this.noiseTexture2 = l.current_scene.loaders.texture.load( './assets/textures/noise2.jpg' );
        this.noiseTexture2.wrapS = this.noiseTexture2.wrapT = THREE.RepeatWrapping;

        // Setup uniforms for the sky.
        this.uniforms = {
            noiseTexture:  { type: "t", value: this.noiseTexture2 },
            scale       :  { type: "f", value: 1 / l.scale / 5 },
            time        :  { type: "f", value: 0.0 }
        };

        this.mesh = this.createSkyMesh();

    }

    createSkyMesh() {
        let skyGeometry = new THREE.SphereGeometry( l.scale, 32, 64 );

        let skyMaterials = new THREE.ShaderMaterial( {
            side          :  THREE.BackSide,
            uniforms      :  this.uniforms,
            vertexShader  :  document.getElementById( 'skyVertShader' ).textContent,
            fragmentShader:  document.getElementById( 'skyFragShader' ).textContent
        } );


        let skyMesh = new THREE.Mesh( skyGeometry, skyMaterials );
        skyMesh.name = 'Sky';
        skyMesh.position.y = l.scale * 0;
        return skyMesh;

    }

    /**
     * Animate hook.
     * 
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     * 
     * @method animate
     * @memberof Sky
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate( delta ) {
        // Iterate the sky uniforms to animate it.
        l.current_scene.objects.sky.uniforms.time.value += delta / 10;
    }

}
