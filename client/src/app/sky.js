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
        this.noiseTexture2 = window.test_scene.loaders.texture.load( './assets/textures/noise2.jpg' );
	    this.noiseTexture2.wrapS = this.noiseTexture2.wrapT = THREE.RepeatWrapping;
        
        // Setup uniforms for the sky.
        this.uniforms = {
            noiseTexture:	{ type: "t", value: this.noiseTexture2 },
            scale: 			{ type: "f", value: 0.000001 },
            time: 			{ type: "f", value: 0.0 }
        };

        this.mesh = this.createSkyMesh();

    }

    createSkyMesh() {
        let skyGeometry = new THREE.SphereGeometry( window.s.scale, 32, 64);

        let skyMaterials = new THREE.ShaderMaterial( {
            side: THREE.DoubleSide,
            uniforms: this.uniforms,
            vertexShader:   document.getElementById( 'cloudVertShader'   ).textContent,
            fragmentShader: document.getElementById( 'cloudFragShader' ).textContent
        } );

       
        let skyMesh = new THREE.Mesh(skyGeometry, skyMaterials);
        skyMesh.name = 'Skybox';
        skyMesh.position.y = window.s.scale * 0;
        return skyMesh;
        
    }

    animate( delta ) {
        // Iterate the sky uniforms to animate it.
        window.test_scene.scene_objects.sky.uniforms.time.value += 0.025;
    }
    
}
