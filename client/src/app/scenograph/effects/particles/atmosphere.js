/**
 * Atmospheric dust while flying.
 *
 * Soft specks recycled in front of the camera.
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

const ATMOSPHERE_COUNT = 12;
const ATMOSPHERE_NEAR = 4;
const ATMOSPHERE_FAR = 280;
const ATMOSPHERE_SPREAD = 0.7;
const ATMOSPHERE_SIZE = 0.6;

const _local = new THREE.Vector3();
const _world = new THREE.Vector3();
const _color = new THREE.Color();

/**
 * Soft circle sprite for atmosphere points.
 */
function softCircleTexture() {
    const size = 64;
    const canvas = document.createElement( 'canvas' );
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext( '2d' );
    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );
    gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
    gradient.addColorStop( 0.2, 'rgba(255,255,255,0.55)' );
    gradient.addColorStop( 0.5, 'rgba(255,255,255,0.12)' );
    gradient.addColorStop( 1, 'rgba(255,255,255,0)' );

    ctx.fillStyle = gradient;
    ctx.fillRect( 0, 0, size, size );

    const texture = new THREE.CanvasTexture( canvas );
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

/**
 * Place a speck ahead of the camera. Biased toward distance.
 */
function scatterInView( camera, target ) {
    const t = Math.random();
    const depth = ATMOSPHERE_NEAR + ( ATMOSPHERE_FAR - ATMOSPHERE_NEAR ) * t * t;
    const half = depth * ATMOSPHERE_SPREAD;
    target.set(
        ( Math.random() * 2 - 1 ) * half,
        ( Math.random() * 2 - 1 ) * half * 0.55,
        -depth
    );
    target.applyMatrix4( camera.matrixWorld );
}

/**
 * Random grey, white, or blue tint.
 */
function randomAtmosphereColor( target ) {
    const roll = Math.random();
    if ( roll < 0.35 ) {
        const grey = 0.4 + Math.random() * 0.35;
        target.setRGB( grey, grey, grey );
    }
    else if ( roll < 0.65 ) {
        const white = 0.85 + Math.random() * 0.15;
        target.setRGB( white, white, white );
    }
    else {
        target.setRGB(
            0.25 + Math.random() * 0.25,
            0.45 + Math.random() * 0.35,
            0.7 + Math.random() * 0.3
        );
    }
}

/**
 * Respawn one speck in view with a new colour.
 */
function respawnSpeck( camera, positions, colors, index ) {
    scatterInView( camera, _world );
    positions.setXYZ( index, _world.x, _world.y, _world.z );
    randomAtmosphereColor( _color );
    colors.setXYZ( index, _color.r, _color.g, _color.b );
}

/**
 * Create the atmospheric dust field.
 */
export function createAtmosphere() {
    const particles = l.current_scene.effects.particles;
    if ( particles.atmosphere ) {
        return particles.atmosphere;
    }

    particles.atmosphereMap = softCircleTexture();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute( new Float32Array( ATMOSPHERE_COUNT * 3 ), 3 )
    );
    geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute( new Float32Array( ATMOSPHERE_COUNT * 3 ), 3 )
    );

    const material = new THREE.PointsMaterial( {
        color: 0xffffff,
        vertexColors: true,
        map: particles.atmosphereMap,
        size: ATMOSPHERE_SIZE,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    } );

    const points = new THREE.Points( geometry, material );
    points.name = 'Atmosphere';
    points.renderOrder = 2; // above ocean
    points.frustumCulled = false;
    points.visible = false;
    points.userData.lastCamera = new THREE.Vector3();
    points.userData.hasLastCamera = false;
    points.userData.needsSeed = true;

    l.current_scene.scene.add( points );
    particles.atmosphere = points;

    return points;
}

/**
 * Recycle dust in front of the camera; fade with motion.
 * Hidden in the hangar.
 */
export function animateAtmosphere( delta ) {
    const points = l.current_scene.effects.particles.atmosphere;
    if ( ! points ) {
        return;
    }

    if ( l.mode === 'hangar' ) {
        points.visible = false;
        points.material.opacity = 0;
        points.userData.hasLastCamera = false;
        points.userData.needsSeed = true;
        return;
    }

    const camera = l.scenograph.cameras.active;
    if ( ! camera ) {
        return;
    }

    camera.updateMatrixWorld();

    const positions = points.geometry.getAttribute( 'position' );
    const colors = points.geometry.getAttribute( 'color' );
    const last = points.userData.lastCamera;
    let speed = 0;
    let colorsDirty = false;

    if ( points.userData.hasLastCamera && delta > 0 ) {
        speed = last.distanceTo( camera.position ) / delta;
    }

    for ( let i = 0; i < positions.count; i++ ) {
        if ( points.userData.needsSeed ) {
            respawnSpeck( camera, positions, colors, i );
            colorsDirty = true;
            continue;
        }

        _local.set(
            positions.getX( i ),
            positions.getY( i ),
            positions.getZ( i )
        ).applyMatrix4( camera.matrixWorldInverse );

        const depth = -_local.z;
        const half = depth * ATMOSPHERE_SPREAD;
        const outOfView = _local.z > -ATMOSPHERE_NEAR
            || _local.z < -ATMOSPHERE_FAR
            || Math.abs( _local.x ) > half
            || Math.abs( _local.y ) > half * 0.55;

        if ( outOfView ) {
            respawnSpeck( camera, positions, colors, i );
            colorsDirty = true;
        }
    }

    positions.needsUpdate = true;
    if ( colorsDirty ) {
        colors.needsUpdate = true;
    }
    points.userData.needsSeed = false;

    // Fade in with camera motion.
    const target = Math.min( 0.65, Math.max( 0, ( speed - 8 ) / 120 ) );
    points.material.opacity += ( target - points.material.opacity ) * Math.min( 1, delta * 4 );
    points.visible = points.material.opacity > 0.01;

    last.copy( camera.position );
    points.userData.hasLastCamera = true;
}
