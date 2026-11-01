/**
 * Afterburner
 *
 * Soft glowing shock-diamond rings along a thruster exhaust axis.
 * Colour shifts orange/red → blue with airspeed; rings cycle aft with speed.
 */

import * as THREE from 'three';

const RING_COUNT = 8;
const RING_PITCH = 0.28;
const RING_START_Y = 0.7;
const BASE_RADIUS = 0.44;

let sharedRingTexture = null;

/**
 * Soft annular glow — bright fuzzy ring band with transparent centre and outer falloff.
 */
function createRingTexture() {
    if ( sharedRingTexture ) {
        return sharedRingTexture;
    }

    const size = 128;
    const canvas = document.createElement( 'canvas' );
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext( '2d' );
    const centre = size / 2;
    const image = context.createImageData( size, size );
    const data = image.data;

    let y = 0;
    let x = 0;
    let dx = 0;
    let dy = 0;
    let radius = 0;
    let ring = 0;
    let alpha = 0;
    let index = 0;

    for ( y = 0; y < size; y++ ) {
        for ( x = 0; x < size; x++ ) {
            dx = ( x + 0.5 ) / size - 0.5;
            dy = ( y + 0.5 ) / size - 0.5;
            radius = Math.sqrt( dx * dx + dy * dy ) * 2;

            // Peak around mid-radius; soft falloff inward and outward.
            ring = 1 - Math.abs( radius - 0.55 ) / 0.45;
            if ( ring < 0 ) {
                ring = 0;
            }
            alpha = Math.pow( ring, 1.6 );

            // Soft core fill so diamonds read as glowing discs, not hollow only.
            if ( radius < 0.55 ) {
                alpha = Math.max( alpha, Math.pow( 1 - radius / 0.55, 2 ) * 0.35 );
            }

            index = ( y * size + x ) * 4;
            data[ index ] = 255;
            data[ index + 1 ] = 255;
            data[ index + 2 ] = 255;
            data[ index + 3 ] = Math.floor( alpha * 255 );
        }
    }

    context.putImageData( image, 0, 0 );

    sharedRingTexture = new THREE.CanvasTexture( canvas );
    sharedRingTexture.needsUpdate = true;
    sharedRingTexture.colorSpace = THREE.SRGBColorSpace;

    return sharedRingTexture;
}

export default class Afterburner {

    /**
     * @param {THREE.Object3D} thrusterContainer Exhaust container (local Y = plume axis).
     */
    constructor( thrusterContainer ) {
        this.container = new THREE.Object3D();
        this.container.name = 'AfterburnerDiamonds';
        thrusterContainer.add( this.container );

        this.rings = [];
        this.phase = 0;
        this.visible = false;

        this._colour = new THREE.Color();
        this._orange = new THREE.Color( 1.0, 0.45, 0.12 );
        this._red = new THREE.Color( 1.0, 0.2, 0.05 );
        this._blue = new THREE.Color( 0.55, 0.8, 1.0 );

        this.createRings();
        this.setVisible( false );
    }

    createRings() {
        const texture = createRingTexture();
        let i = 0;
        let mesh = null;
        let material = null;
        let taper = 1;

        for ( i = 0; i < RING_COUNT; i++ ) {
            taper = 1 - ( i / ( RING_COUNT - 1 ) ) * 0.55;

            material = new THREE.MeshBasicMaterial( {
                map: texture,
                color: 0xffffff,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                opacity: 0,
            } );

            if ( 'toneMapped' in material ) {
                material.toneMapped = false;
            }

            mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), material );
            // Face along exhaust (local +Y).
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.y = RING_START_Y + i * RING_PITCH;
            mesh.scale.setScalar( BASE_RADIUS * taper );
            mesh.renderOrder = 1000;
            mesh.frustumCulled = false;

            this.container.add( mesh );
            this.rings.push( {
                mesh: mesh,
                material: material,
                baseScale: BASE_RADIUS * taper,
                baseOpacity: 0.95 - i * 0.08,
            } );
        }
    }

    setVisible( visible ) {
        this.visible = visible;
        this.container.visible = visible;
    }

    /**
     * @param {number} speed Absolute airspeed in sim units (HUD km/h ≈ speed × 60).
     * @param {number} blend Afterburner crossfade 0–1.
     */
    update( speed, blend ) {
        const kmh = speed * 240;
        let cycleRate = 0;
        let pulse = 0;
        let opacity = 0;
        let scalePulse = 1;
        let i = 0;
        let ring = null;
        let warmT = 0;
        let blueT = 0;

        if ( blend < 0.01 ) {
            if ( this.visible ) {
                this.setVisible( false );
            }
            return;
        }

        if ( ! this.visible ) {
            this.setVisible( true );
        }

        // Colour: orange → red through 400–800, then toward blue above 800.
        if ( kmh < 400 ) {
            this._colour.copy( this._orange );
        }
        else if ( kmh < 800 ) {
            warmT = ( kmh - 400 ) / 400;
            this._colour.copy( this._orange ).lerp( this._red, warmT );
        }
        else {
            blueT = Math.min( 1, ( kmh - 800 ) / 200 );
            this._colour.copy( this._red ).lerp( this._blue, blueT );
        }

        cycleRate = 2.2 + Math.min( 4, speed * 0.35 );
        if ( kmh > 800 ) {
            cycleRate += 1.5;
        }
        this.phase += cycleRate * ( 1 / 60 );

        for ( i = 0; i < this.rings.length; i++ ) {
            ring = this.rings[ i ];
            pulse = 0.55 + 0.45 * Math.sin( this.phase - i * 0.85 );
            opacity = ring.baseOpacity * blend * pulse;
            scalePulse = 0.85 + 0.2 * pulse;

            ring.material.color.copy( this._colour );
            ring.material.opacity = opacity;
            ring.mesh.scale.setScalar( ring.baseScale * scalePulse );
        }
    }

}
