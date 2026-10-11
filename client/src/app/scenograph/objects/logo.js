/**
 * Title screen logo.
 *
 * Own canvas, above the scene fade and under the menu. Geometry material 0
 * is water, material 1 is casing metal. Both shaders sample the orbiting
 * point light through uniforms.
 */

import * as THREE from 'three';

import l from '@/helpers/l.js';
import { proceduralMetalMaterial2 } from '@/scenograph/materials.js';

const LOGO_URL = './assets/models/langenium%20logo.json';
const CAMERA_DISTANCE = 6;
const ORBIT_STEP = 0.012;

const lightUniforms = `
uniform vec3 logoLightPos;
uniform float logoLightIntensity;
uniform float logoLightRange;
`;

const metalLightUniform = 'uniform vec3 logoFixedLightDir;\n';

const metalPointLight = `
    vec3 toLight = logoLightPos - (cameraPosition - vViewPosition);
    float lightDist = max(length(toLight), 1e-4);
    float ndotl = max(dot(normalize(perturbedNormal), toLight / lightDist), 0.0);
    float falloff = 1.0 / (1.0 + pow(lightDist / max(logoLightRange, 1e-4), 2.0));
    gl_FragColor.rgb += ndotl * falloff * logoLightIntensity;
`;

const waterPointLight = `
    vec3 toLight = (viewMatrix * vec4(logoLightPos, 1.0)).xyz + vViewPosition;
    float lightDist = max(length(toLight), 1e-4);
    float ndotl = max(dot(normalize(normal), toLight / lightDist), 0.0);
    float falloff = 1.0 / (1.0 + pow(lightDist / max(logoLightRange, 1e-4), 2.0));
    gl_FragColor.rgb += vec3(0.12, 0.42, 0.85) * ndotl * falloff * logoLightIntensity;
    gl_FragColor.rgb = clamp(gl_FragColor.rgb, 0.0, 1.0);
`;

function patch( source, from, to ) {
    return source.replace( from, to );
}

export default class Logo {

    constructor() {
        this.mesh = new THREE.Group();
        this.mesh.name = 'Langenium Logo';
        this.mesh.visible = false;
        this.width = 1;
        this.height = 1;
        this._size = new THREE.Vector2();
        this._logoCenter = new THREE.Vector3();
        this._localLightDir = new THREE.Vector3( 0.1, 1.0, 0.1 ).normalize();
        this.logoLightPos = new THREE.Vector3();
        this.logoFixedLightDir = this._localLightDir.clone();
        this.logoLightIntensity = { value: 1 };
        this.logoLightRange = { value: 0.1 };
        this.lightAngle = 0;
    }

    async load() {
        const json = await ( await fetch( LOGO_URL ) ).json();
        const geometries = splitLogo( json );

        this.water = new THREE.Mesh( geometries[ 0 ], logoWater( this ) );
        this.water.name = 'Langenium Logo Water';

        const metal = new THREE.Mesh( geometries[ 1 ], casingMetal( this ) );
        metal.name = 'Langenium Logo Metal';
        this.mesh.add( metal, this.water );

        const size = new THREE.Box3().setFromObject( this.mesh ).getSize( new THREE.Vector3() );
        this.width = size.x || 1;
        this.height = size.y || 1;

        this.light = new THREE.PointLight( 0xffffff, this.logoLightIntensity.value );
        this.light.name = 'Langenium Logo Light';
        this.mesh.add( this.light );

        this.mountLayer();

        const screen = document.getElementById( 'title_screen' );
        if ( screen && screen.classList.contains( 'active' ) ) {
            this.show();
        }
    }

    // z-index 4: above the scene fade, under the menu.
    mountLayer() {
        this.layerScene = new THREE.Scene();
        this.layerScene.add( this.mesh );

        this.canvas = document.createElement( 'canvas' );
        this.canvas.id = 'langenium_logo_layer';
        this.canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:4';
        ( document.getElementById( 'webgl-wrapper' ) || document.body ).appendChild( this.canvas );

        this.renderer = new THREE.WebGLRenderer( {
            canvas: this.canvas,
            alpha: true,
            antialias: true,
        } );
        this.renderer.setClearColor( 0x000000, 0 );
        this.renderer.autoClear = true;
        this.syncSize();
    }

    syncSize() {
        const main = l.current_scene.renderers && l.current_scene.renderers.webgl;
        if ( ! main ) {
            return;
        }

        const ratio = main.getPixelRatio();
        const size = main.getSize( this._size );
        if ( this.renderer.getPixelRatio() !== ratio ) {
            this.renderer.setPixelRatio( ratio );
        }
        if ( this.canvas.width !== Math.round( size.x * ratio ) || this.canvas.height !== Math.round( size.y * ratio ) ) {
            this.renderer.setSize( size.x, size.y );
        }
    }

    show() {
        this.mesh.visible = true;
        this.place();
    }

    hide() {
        this.mesh.visible = false;
        if ( this.renderer ) {
            this.renderer.clear();
        }
    }

    /**
     * Animate hook.
     *
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     *
     * @method animate
     * @memberof Logo
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate() {
        const logo = l.current_scene.objects.logo;
        if ( ! logo || ! logo.water || ! logo.mesh.visible ) {
            return;
        }

        logo.water.material.uniforms.time.value += ( 1 / 60 ) / 20;
    }

    render() {
        if ( ! this.renderer || ! this.mesh.visible ) {
            return;
        }

        const camera = l.scenograph.cameras.active;
        if ( ! camera ) {
            return;
        }

        this.syncSize();
        this.orbitLight();
        this.renderer.render( this.layerScene, camera );
    }

    // Left to right across the front. Half speed in front, double speed behind.
    orbitLight() {
        const facing = Math.sin( this.lightAngle );
        this.lightAngle -= ORBIT_STEP * ( 1.25 - 0.75 * facing );

        const radius = Math.max( this.width, this.height ) * 0.6;
        this.light.position.set(
            Math.cos( this.lightAngle ) * radius,
            radius * 0.15,
            Math.sin( this.lightAngle ) * radius
        );

        this.light.updateWorldMatrix( true, false );
        this.light.getWorldPosition( this.logoLightPos );
        this.logoFixedLightDir.copy( this._localLightDir ).transformDirection( this.mesh.matrixWorld );
        this.mesh.getWorldPosition( this._logoCenter );
        this.logoLightIntensity.value = this.light.intensity;
        this.logoLightRange.value = Math.max( this._logoCenter.distanceTo( this.logoLightPos ), 0.001 );
    }

    place() {
        const camera = l.scenograph.cameras.active;
        const mount = document.querySelector( '[data-mount="langenium-logo"]' );
        const canvas = l.current_scene.renderers.webgl.domElement;
        if ( ! camera || ! mount || ! canvas ) {
            return;
        }

        const rect = mount.getBoundingClientRect();
        const view = canvas.getBoundingClientRect();
        if ( rect.width < 1 || rect.height < 1 ) {
            return;
        }

        const ndcLeft = ( ( rect.left - view.left ) / view.width ) * 2 - 1;
        const narrow = view.width <= 720 || view.height <= 520;
        const visibleHeight = 2 * Math.tan( THREE.MathUtils.degToRad( camera.fov ) / 2 ) * CAMERA_DISTANCE;
        const visibleWidth = visibleHeight * ( view.width / view.height );
        const worldPerPixel = visibleHeight / view.height;
        let scale = Math.min(
            ( rect.width * worldPerPixel ) / this.width,
            ( rect.height * worldPerPixel ) / this.height
        ) * ( narrow ? 1 : 1.5 );

        if ( narrow ) {
            const maxWidth = Math.max( 1, view.width - ( rect.left - view.left ) - 16 );
            const maxHeight = view.height * 0.2;
            scale = Math.min(
                scale,
                ( maxWidth * worldPerPixel ) / this.width,
                ( maxHeight * worldPerPixel ) / this.height
            );
        }

        const topNdc = narrow
            ? 1 - ( ( rect.top - view.top ) / view.height ) * 2
            : 1 - 0.04 * 2;

        this.mesh.scale.setScalar( scale );
        this.mesh.position.copy( camera.position );
        this.mesh.quaternion.copy( camera.quaternion );
        this.mesh.translateX( ndcLeft * visibleWidth / 2 + ( this.width * scale ) / 2 );
        this.mesh.translateY( topNdc * visibleHeight / 2 - ( this.height * scale ) / 2 );
        this.mesh.translateZ( -CAMERA_DISTANCE );
    }

}

function shaderLightUniforms( logo, fixedDir ) {
    const uniforms = {
        logoLightPos: { value: logo.logoLightPos },
        logoLightIntensity: logo.logoLightIntensity,
        logoLightRange: logo.logoLightRange,
    };

    if ( fixedDir ) {
        uniforms.logoFixedLightDir = { value: logo.logoFixedLightDir };
    }

    return uniforms;
}

// Inlined so the metal light direction can follow the mesh instead of viewMatrix.
function casingMetal( logo ) {
    const material = proceduralMetalMaterial2( {
        uniforms: {
            scale: { value: 3.55 },
            lacunarity: { value: 2.0 },
            randomness: { value: 1.0 },
            ...shaderLightUniforms( logo, true ),
        }
    } );

    const normal = patch( document.getElementById( 'normalGLSL' ).textContent,
        'vec3 lightDir = normalize(vec3(0.1, 1.0, 0.1) - vViewPosition);',
        'vec3 lightDir = normalize(logoFixedLightDir);' )
        .replace(
            'vec3 viewDir = normalize(vViewPosition - vTexCoord3D);',
            'vec3 viewDir = normalize(vViewPosition);'
        )
        .replace(
            'vec4 lDirection = viewMatrix * vec4(normalize(vec3(0.1, 1.0, 0.1)), 0.0);',
            'vec4 lDirection = vec4(lightDir, 0.0);'
        );

    material.side = THREE.DoubleSide;
    material.fragmentShader = lightUniforms + metalLightUniform + patch(
        material.fragmentShader,
        '#include <normal>',
        normal
    ).replace(
        'gl_FragColor += vec4(baseColor * lightWeighting, 1.0);',
        'gl_FragColor += vec4(baseColor * lightWeighting, 1.0);\n    gl_FragColor.rgb = gl_FragColor.rgb * 1.75 + 0.06;' + metalPointLight
    );

    return material;
}

function logoWater( logo ) {
    const mirror = new THREE.DataTexture( new Uint8Array( [ 22, 72, 120, 255 ] ), 1, 1 );
    mirror.needsUpdate = true;

    let fragmentShader = document.getElementById( 'logoWaterFragShader' ).textContent;
    fragmentShader = patch( fragmentShader,
        'vec4 lDirection = viewMatrix * vec4( normalize( vec3( 1.0, 0.0, 0.5 ) ), 0.0 );',
        'vec4 lDirection = vec4( normalize( vec3( 0.2, 1.0, 0.4 ) ), 0.0 );' );
    fragmentShader = patch( fragmentShader,
        'vLightWeighting += vec3( 1.0, 0.5, 0.0 ) * dirSpecularWeight * n * 2.0;',
        'vLightWeighting += vec3( 0.15, 0.55, 1.0 ) * dirSpecularWeight * n * 2.0;' );
    fragmentShader = patch( fragmentShader,
        'gl_FragColor.rgb = clamp( gl_FragColor.rgb, 0.0, 1.0 );',
        waterPointLight );

    return new THREE.ShaderMaterial( {
        uniforms: {
            textureMatrix: { value: new THREE.Matrix4() },
            time: { value: 0 },
            scale: { value: 0.125 },
            alpha: { value: 0.85 },
            bias: { value: 0 },
            mirrorColor: { value: new THREE.Color( 0x186090 ) },
            mirrorSampler: { value: mirror },
            ...shaderLightUniforms( logo, false ),
        },
        vertexShader: document.getElementById( 'logoWaterVertShader' ).textContent,
        fragmentShader: lightUniforms + fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
    } );
}

// Face type 34: triangle, material index, three vertex normals.
// Source mesh lies flat; this stands it up.
function splitLogo( json ) {
    const { faces, vertices } = json;
    const buckets = [ [], [] ];

    const push = ( list, index ) => {
        const offset = index * 3;
        list.push( vertices[ offset ], -vertices[ offset + 2 ], vertices[ offset + 1 ] );
    };

    for ( let i = 0; i < faces.length; i += 8 ) {
        const list = buckets[ faces[ i + 4 ] ] || buckets[ 0 ];
        push( list, faces[ i + 1 ] );
        push( list, faces[ i + 2 ] );
        push( list, faces[ i + 3 ] );
    }

    const bounds = new THREE.Box3();
    const point = new THREE.Vector3();
    buckets.forEach( ( positions ) => {
        for ( let i = 0; i < positions.length; i += 3 ) {
            bounds.expandByPoint( point.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] ) );
        }
    } );

    const center = bounds.getCenter( new THREE.Vector3() );

    return buckets.map( ( positions ) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        geometry.translate( -center.x, -center.y, -center.z );
        geometry.computeVertexNormals();
        geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( new Float32Array( ( positions.length / 3 ) * 2 ), 2 ) );
        return geometry;
    } );
}
