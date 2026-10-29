/**
 * Wind strokes while flying.
 *
 * Short lines that draw past the camera, then fade.
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

const WIND_COUNT = 8;
const WIND_NEAR = 20;
const WIND_FAR = 180;
const WIND_SPREAD = 0.85;

const _local = new THREE.Vector3();
const _origin = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _wind = new THREE.Vector3();
const _end = new THREE.Vector3();
const _velocity = new THREE.Vector3();

/**
 * Place a stroke origin ahead of the camera (biased to the sides).
 */
function scatterOrigin( camera, target ) {
    const t = Math.random();
    const depth = WIND_NEAR + ( WIND_FAR - WIND_NEAR ) * t * t;
    const half = depth * WIND_SPREAD;
    const side = Math.random() < 0.5 ? -1 : 1;
    target.set(
        side * ( half * 0.35 + Math.random() * half * 0.65 ),
        ( Math.random() * 2 - 1 ) * half * 0.4,
        -depth
    );
    target.applyMatrix4( camera.matrixWorld );
}

/**
 * Reset one stroke along the wind direction.
 */
function respawnStroke( stroke, camera, windDir ) {
    scatterOrigin( camera, _origin );

    _dir.copy( windDir ).normalize();
    _dir.x += ( Math.random() * 2 - 1 ) * 0.15;
    _dir.y += ( Math.random() * 2 - 1 ) * 0.1;
    _dir.normalize();

    stroke.userData.origin.copy( _origin );
    stroke.userData.direction.copy( _dir );
    stroke.userData.length = 18 + Math.random() * 28;
    stroke.userData.duration = 0.45 + Math.random() * 0.55;
    stroke.userData.age = 0;
    stroke.userData.delay = Math.random() * 0.35;

    if ( Math.random() < 0.5 ) {
        stroke.material.color.setRGB(
            0.45 + Math.random() * 0.2,
            0.65 + Math.random() * 0.2,
            0.85 + Math.random() * 0.15
        );
    }
    else {
        const grey = 0.55 + Math.random() * 0.35;
        stroke.material.color.setRGB( grey, grey, grey );
    }

    const positions = stroke.geometry.getAttribute( 'position' );
    positions.setXYZ( 0, _origin.x, _origin.y, _origin.z );
    positions.setXYZ( 1, _origin.x, _origin.y, _origin.z );
    positions.needsUpdate = true;
    stroke.material.opacity = 0;
}

/**
 * Hide strokes and clear motion state.
 */
function hideStrokes( group ) {
    group.visible = false;
    group.userData.seeded = false;
    group.children.forEach( ( stroke ) => {
        stroke.material.opacity = 0;
        stroke.userData.age = 0;
    } );
}

/**
 * Create the wind stroke group.
 */
export function createWind() {
    const particles = l.current_scene.effects.particles;
    if ( particles.wind ) {
        return particles.wind;
    }

    const group = new THREE.Group();
    group.name = 'Wind';
    group.visible = false;
    group.userData.lastCamera = new THREE.Vector3();
    group.userData.hasLastCamera = false;
    group.userData.seeded = false;

    for ( let i = 0; i < WIND_COUNT; i++ ) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute( new Float32Array( 6 ), 3 )
        );

        const material = new THREE.LineBasicMaterial( {
            color: 0xc8dce8,
            transparent: true,
            opacity: 0,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        } );

        const line = new THREE.Line( geometry, material );
        line.frustumCulled = false;
        line.renderOrder = 2;
        line.userData.origin = new THREE.Vector3();
        line.userData.direction = new THREE.Vector3();
        line.userData.length = 24;
        line.userData.duration = 0.6;
        line.userData.age = 0;
        line.userData.delay = 0;

        group.add( line );
    }

    l.current_scene.scene.add( group );
    particles.wind = group;

    return group;
}

/**
 * Grow / fade strokes with camera motion. Hidden in the hangar.
 */
export function animateWind( delta ) {
    const group = l.current_scene.effects.particles.wind;
    if ( ! group ) {
        return;
    }

    if ( l.mode === 'hangar' ) {
        group.userData.hasLastCamera = false;
        hideStrokes( group );
        return;
    }

    const camera = l.scenograph.cameras.active;
    if ( ! camera ) {
        return;
    }

    camera.updateMatrixWorld();

    const last = group.userData.lastCamera;
    let speed = 0;

    if ( group.userData.hasLastCamera && delta > 0 ) {
        _velocity.subVectors( camera.position, last ).divideScalar( delta );
        speed = _velocity.length();
    }

    if ( speed <= 12 ) {
        hideStrokes( group );
        last.copy( camera.position );
        group.userData.hasLastCamera = true;
        return;
    }

    group.visible = true;
    _wind.copy( _velocity ).normalize().negate();
    const strength = Math.min( 1, ( speed - 12 ) / 90 );

    if ( ! group.userData.seeded ) {
        group.children.forEach( ( stroke ) => {
            respawnStroke( stroke, camera, _wind );
        } );
        group.userData.seeded = true;
    }

    group.children.forEach( ( stroke ) => {
        stroke.userData.age += delta;

        if ( stroke.userData.age < stroke.userData.delay ) {
            stroke.material.opacity = 0;
            return;
        }

        const life = stroke.userData.age - stroke.userData.delay;
        if ( life > stroke.userData.duration ) {
            respawnStroke( stroke, camera, _wind );
            return;
        }

        // Grow, then fade.
        const t = life / stroke.userData.duration;
        const draw = t < 0.55 ? t / 0.55 : 1;
        const fade = t < 0.55 ? 0.15 + draw * 0.85 : 1 - ( t - 0.55 ) / 0.45;

        _origin.copy( stroke.userData.origin );
        _end.copy( _origin ).addScaledVector(
            stroke.userData.direction,
            stroke.userData.length * draw
        );

        // Recycle once the tip has passed the camera.
        _local.copy( _end ).applyMatrix4( camera.matrixWorldInverse );
        if ( _local.z > -WIND_NEAR * 0.25 ) {
            respawnStroke( stroke, camera, _wind );
            return;
        }

        const positions = stroke.geometry.getAttribute( 'position' );
        positions.setXYZ( 0, _origin.x, _origin.y, _origin.z );
        positions.setXYZ( 1, _end.x, _end.y, _end.z );
        positions.needsUpdate = true;

        stroke.material.opacity = fade * strength * 0.55;
    } );

    last.copy( camera.position );
    group.userData.hasLastCamera = true;
}
