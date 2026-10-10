/**
 * Title-screen logo. io_three Geometry JSON: material 0 is water, material 1
 * is the platform casing metal. Held near the top of the screen, left
 * aligned with the title-screen logo mount.
 *
 * Drawn on its own transparent canvas, above the scene-change fade and
 * under the menu, so a background cut does not take the letters with it.
 */

import * as THREE from 'three';

import l from '@/helpers/l.js';
import { proceduralMetalMaterial2 } from '@/scenograph/materials.js';

const LOGO_URL = './assets/models/langenium%20logo.json';
const CAMERA_DISTANCE = 6;

export default class Logo {

    constructor() {
        this.mesh = new THREE.Group();
        this.mesh.name = 'Langenium Logo';
        this.mesh.visible = false;
        this.width = 1;
        this.height = 1;
        this._size = new THREE.Vector2();
    }

    async load() {
        const json = await ( await fetch( LOGO_URL ) ).json();
        const geometries = splitLogo( json );

        this.water = new THREE.Mesh( geometries[ 0 ], logoWater() );
        this.water.name = 'Langenium Logo Water';

        const metal = new THREE.Mesh( geometries[ 1 ], casingMetal() );
        metal.name = 'Langenium Logo Metal';
        metal.castShadow = true;

        this.mesh.add( metal, this.water );

        const size = new THREE.Box3().setFromObject( this.mesh ).getSize( new THREE.Vector3() );
        this.width = size.x || 1;
        this.height = size.y || 1;

        this.mountLayer();

        const screen = document.getElementById( 'title_screen' );
        if ( screen && screen.classList.contains( 'active' ) ) {
            this.show();
        }
    }

    // Scene canvas, then the fade, then this. The menu sits above all three.
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
        this.renderer.render( this.layerScene, camera );
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
        const ndcTop = 1 - 0.04 * 2;
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
            : ndcTop;

        this.mesh.scale.setScalar( scale );
        this.mesh.position.copy( camera.position );
        this.mesh.quaternion.copy( camera.quaternion );
        this.mesh.translateX( ndcLeft * visibleWidth / 2 + ( this.width * scale ) / 2 );
        this.mesh.translateY( topNdc * visibleHeight / 2 - ( this.height * scale ) / 2 );
        this.mesh.translateZ( -CAMERA_DISTANCE );
    }

}

function casingMetal() {
    const material = proceduralMetalMaterial2( {
        uniforms: {
            scale: { value: 3.55 },
            lacunarity: { value: 2.0 },
            randomness: { value: 1.0 },
        }
    } );

    material.side = THREE.DoubleSide;
    material.fragmentShader = material.fragmentShader.replace(
        'gl_FragColor += vec4(baseColor * lightWeighting, 1.0);',
        'gl_FragColor += vec4(baseColor * lightWeighting, 1.0);\n    gl_FragColor.rgb = gl_FragColor.rgb * 1.75 + 0.06;'
    );

    return material;
}

function logoWater() {
    const mirror = new THREE.DataTexture( new Uint8Array( [ 22, 72, 120, 255 ] ), 1, 1 );
    mirror.needsUpdate = true;

    return new THREE.ShaderMaterial( {
        uniforms: {
            textureMatrix: { value: new THREE.Matrix4() },
            time: { value: 0 },
            scale: { value: 1 },
            alpha: { value: 0.85 },
            bias: { value: 0 },
            mirrorColor: { value: new THREE.Color( 0x186090 ) },
            mirrorSampler: { value: mirror },
        },
        vertexShader: document.getElementById( 'logoWaterVertShader' ).textContent,
        fragmentShader: document.getElementById( 'logoWaterFragShader' ).textContent,
        transparent: true,
        side: THREE.DoubleSide,
    } );
}

// Type 34 faces only: triangle, material index, three vertex normals.
// The mesh lies flat; stand it up and flip the letter axis upright.
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
