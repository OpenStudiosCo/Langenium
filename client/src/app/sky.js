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
        // let skyMaterials = [ 
        //     new THREE.ShaderMaterial( {
        //         side: THREE.DoubleSide,
        //         uniforms: this.uniforms,
        //         vertexShader:   document.getElementById( 'cloudVertShader'   ).textContent,
        //         fragmentShader: document.getElementById( 'cloudFragShader' ).textContent
        //     } ) ,
        //     new THREE.MeshBasicMaterial( { color: 0x002244, side: THREE.DoubleSide  } )
        // ];
        let skyMaterials = new THREE.ShaderMaterial( {
            side: THREE.DoubleSide,
            uniforms: this.uniforms,
            vertexShader:   document.getElementById( 'cloudVertShader'   ).textContent,
            fragmentShader: document.getElementById( 'cloudFragShader' ).textContent
        } );

        // var materialIndices = new Uint8Array(skyGeometry.attributes.position.count);

        // for (var i = 0; i < skyGeometry.attributes.position.count; i++) {
        //     var vertexY = skyGeometry.attributes.position.getY(i);

        //     if (vertexY > -21000) {
        //         materialIndices[i] = 0;
        //     } else {
        //         materialIndices[i] = 1;
        //     }
        // }

        // skyGeometry.setAttribute('materialIndex', new THREE.BufferAttribute(materialIndices, 1));

        let skyMesh = new THREE.Mesh(skyGeometry, skyMaterials);
        skyMesh.name = 'Skybox';
        skyMesh.position.y = 24475;
        return skyMesh;
        
    }

    animate( currentTime ) {
        // Iterate the sky uniforms to animate it.
        window.test_scene.scene_objects.sky.uniforms.time.value += 0.000025 * currentTime;
    }
    
}
