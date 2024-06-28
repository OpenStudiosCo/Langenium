/**
 * Sky sphere
 */
import * as THREE from 'three';


export default class Sky {
    // Configuration
    uniforms;

    // Image Texture
    noiseTexture2;

    // The sky mesh.
    mesh;

    constructor() {

        // todo: Make this reusable.
        this.noiseTexture2 = window.l.current_scene.loaders.texture.load( './assets/textures/noise2.jpg' );
        this.noiseTexture2.wrapS = this.noiseTexture2.wrapT = THREE.RepeatWrapping;

        // Setup uniforms for the sky.
        this.uniforms = {
            noiseTexture:  { type: "t", value: this.noiseTexture2 },
            scale       :  { type: "f", value: 1 / window.l.scale / 5 },
            time        :  { type: "f", value: 0.0 }
        };

        this.mesh = this.createSkyMesh();

    }

    createSkyMesh() {
        let skyGeometry = new THREE.SphereGeometry( window.l.scale, 32, 64 );

        let skyMaterials = new THREE.ShaderMaterial( {
            side          :  THREE.DoubleSide,
            uniforms      :  this.uniforms,
            vertexShader  :  document.getElementById( 'skyVertShader' ).textContent,
            fragmentShader:  document.getElementById( 'skyFragShader' ).textContent
        } );


        let skyMesh = new THREE.Mesh( skyGeometry, skyMaterials );
        skyMesh.name = 'Skybox';
        skyMesh.position.y = window.l.scale * 0;
        return skyMesh;

    }

    animate( delta ) {
        // Iterate the sky uniforms to animate it.
        window.l.current_scene.scene_objects.sky.uniforms.time.value += 0.025;
    }

}
