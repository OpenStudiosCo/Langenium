/**
 * Afterburner
 *
 * Bicone Mach diamonds along a thruster exhaust axis, with chromatic
 * warm/cool fringing and a thruster-local plume sheath that pinches
 * around each diamond cell.
 */

import * as THREE from 'three';

const DIAMOND_COUNT = 12;
const DIAMOND_PITCH = 0.5;
const DIAMOND_START_Y = 0.38;
const BASE_RADIUS = 0.26;
const HALF_LENGTH = 0.2;
const SHEATH_SEGMENTS = 64;
const SHEATH_RADIAL = 16;

const diamondVertexShader = /* glsl */ `
    varying float vAlong;
    varying float vRadial;

    void main() {
        // Cone local: tip at +Y, base at −Y. Radial distance in XZ.
        vAlong = position.y;
        vRadial = length( position.xz );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;

const diamondFragmentShader = /* glsl */ `
    uniform vec3 warmColour;
    uniform vec3 coolColour;
    uniform vec3 coreColour;
    uniform float opacity;
    uniform float faceSign;
    uniform float softEdge;

    varying float vAlong;
    varying float vRadial;

    void main() {
        // Unit cone: tip at +0.5, base at −0.5. tipT 0 at tip → 1 at base.
        float tipT = clamp( 0.5 - vAlong, 0.0, 1.0 );
        // faceSign −1 (leading) → warm; +1 (trailing) → cool.
        vec3 shock = mix( warmColour, coolColour, faceSign * 0.5 + 0.5 );
        // Hotter toward the wide base (shock intersection / X node).
        float baseGlow = pow( tipT, 1.35 );
        vec3 colour = mix( shock, coreColour, baseGlow * 0.7 );

        // Expected surface radius at this height; soften inward and past the rim.
        float surfaceR = max( tipT, 0.02 );
        float rim = 1.0 - smoothstep( surfaceR * ( 1.0 - softEdge ), surfaceR * 1.05, vRadial );
        float hollow = smoothstep( 0.0, surfaceR * 0.35, vRadial );
        float alpha = opacity * ( 0.25 + 0.75 * baseGlow ) * rim * ( 0.45 + 0.55 * hollow );

        if ( alpha < 0.01 ) {
            discard;
        }

        gl_FragColor = vec4( colour, alpha );
    }
`;

const sheathVertexShader = /* glsl */ `
    uniform float startY;
    uniform float pitch;
    uniform float baseRadius;
    uniform float pinch;
    uniform float bulge;
    uniform float breath;
    uniform float phase;

    varying float vAlong;
    varying float vRadiusNorm;

    void main() {
        vAlong = position.y;
        float t = ( position.y - startY ) / max( pitch, 0.0001 );
        // 1 at diamond centres (bulge), 0 at nodes between (pinch).
        float cell = abs( cos( t * 3.14159265 ) );
        float radiusScale = mix( pinch, bulge, cell );
        radiusScale *= 1.0 + breath * 0.08 * sin( phase + t * 2.2 );

        vec3 pos = position;
        pos.x *= radiusScale;
        pos.z *= radiusScale;

        float maxR = max( baseRadius * bulge, 0.0001 );
        vRadiusNorm = length( pos.xz ) / maxR;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    }
`;

const sheathFragmentShader = /* glsl */ `
    uniform vec3 sheathColour;
    uniform float opacity;
    uniform float startY;
    uniform float lengthY;

    varying float vAlong;
    varying float vRadiusNorm;

    void main() {
        float aft = clamp( ( vAlong - startY ) / max( lengthY, 0.0001 ), 0.0, 1.0 );
        float fade = 1.0 - pow( aft, 1.35 );
        float rim = smoothstep( 0.15, 0.85, vRadiusNorm ) * ( 1.0 - smoothstep( 0.85, 1.15, vRadiusNorm ) );
        float alpha = opacity * fade * ( 0.25 + 0.75 * rim );

        if ( alpha < 0.01 ) {
            discard;
        }

        gl_FragColor = vec4( sheathColour, alpha );
    }
`;

function createDiamondMaterial( faceSign ) {
    const material = new THREE.ShaderMaterial( {
        uniforms: {
            warmColour: { value: new THREE.Color( 1.0, 0.45, 0.12 ) },
            coolColour: { value: new THREE.Color( 0.35, 0.75, 1.0 ) },
            coreColour: { value: new THREE.Color( 1.0, 0.92, 0.85 ) },
            opacity: { value: 0 },
            faceSign: { value: faceSign },
            softEdge: { value: 0.12 },
        },
        vertexShader: diamondVertexShader,
        fragmentShader: diamondFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    } );

    if ( 'toneMapped' in material ) {
        material.toneMapped = false;
    }

    return material;
}

function createSheathMaterial() {
    const material = new THREE.ShaderMaterial( {
        uniforms: {
            startY: { value: DIAMOND_START_Y - HALF_LENGTH },
            pitch: { value: DIAMOND_PITCH },
            baseRadius: { value: BASE_RADIUS },
            pinch: { value: 0.42 },
            bulge: { value: 1.05 },
            breath: { value: 0 },
            phase: { value: 0 },
            lengthY: { value: ( DIAMOND_COUNT - 1 ) * DIAMOND_PITCH + HALF_LENGTH * 2 },
            sheathColour: { value: new THREE.Color( 0.45, 0.65, 1.0 ) },
            opacity: { value: 0 },
        },
        vertexShader: sheathVertexShader,
        fragmentShader: sheathFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    } );

    if ( 'toneMapped' in material ) {
        material.toneMapped = false;
    }

    return material;
}

export default class Afterburner {

    /**
     * @param {THREE.Object3D} thrusterContainer Exhaust container (local Y = plume axis).
     */
    constructor( thrusterContainer ) {
        this.container = new THREE.Object3D();
        this.container.name = 'AfterburnerDiamonds';
        thrusterContainer.add( this.container );

        this.diamonds = [];
        this.sheath = null;
        this.sheathMaterial = null;
        this.phase = 0;
        this.visible = false;

        this._warm = new THREE.Color( 1.0, 0.45, 0.12 );
        this._cool = new THREE.Color( 0.35, 0.75, 1.0 );
        this._core = new THREE.Color( 1.0, 0.92, 0.85 );
        this._orange = new THREE.Color( 1.0, 0.45, 0.12 );
        this._red = new THREE.Color( 1.0, 0.22, 0.06 );
        this._blue = new THREE.Color( 0.45, 0.78, 1.0 );
        this._sheathColour = new THREE.Color( 0.45, 0.65, 1.0 );

        this.createDiamonds();
        this.createSheath();
        this.setVisible( false );
    }

    createDiamonds() {
        let i = 0;
        let taper = 1;
        let group = null;
        let leading = null;
        let trailing = null;
        let leadingMat = null;
        let trailingMat = null;
        let geometry = null;
        let centreY = 0;

        // Shared geometry: tip +Y, base −Y. Open so interior reads as gas, not solid.
        geometry = new THREE.ConeGeometry( 1, 1, 12, 1, true );

        for ( i = 0; i < DIAMOND_COUNT; i++ ) {
            taper = 1 - ( i / Math.max( 1, DIAMOND_COUNT - 1 ) ) * 0.45;
            centreY = DIAMOND_START_Y + i * DIAMOND_PITCH;

            group = new THREE.Group();
            group.name = 'ShockDiamond_' + i;
            group.position.y = centreY;

            leadingMat = createDiamondMaterial( -1 );
            trailingMat = createDiamondMaterial( 1 );

            // Leading half: tip toward nozzle (−Y).
            leading = new THREE.Mesh( geometry, leadingMat );
            leading.rotation.x = Math.PI;
            leading.position.y = -HALF_LENGTH * 0.5;
            leading.scale.set( BASE_RADIUS * taper, HALF_LENGTH, BASE_RADIUS * taper );
            leading.renderOrder = 1000;
            leading.frustumCulled = false;

            // Trailing half: tip aft (+Y).
            trailing = new THREE.Mesh( geometry, trailingMat );
            trailing.position.y = HALF_LENGTH * 0.5;
            trailing.scale.set( BASE_RADIUS * taper, HALF_LENGTH, BASE_RADIUS * taper );
            trailing.renderOrder = 1000;
            trailing.frustumCulled = false;

            group.add( leading );
            group.add( trailing );
            this.container.add( group );

            this.diamonds.push( {
                group: group,
                leading: leading,
                trailing: trailing,
                leadingMat: leadingMat,
                trailingMat: trailingMat,
                baseScale: taper,
                // Fade aft; tip of the chain stays faintly visible.
                baseOpacity: 0.95 - ( i / Math.max( 1, DIAMOND_COUNT - 1 ) ) * 0.7,
                centreY: centreY,
            } );
        }
    }

    createSheath() {
        const startY = DIAMOND_START_Y - HALF_LENGTH;
        const endY = DIAMOND_START_Y + ( DIAMOND_COUNT - 1 ) * DIAMOND_PITCH + HALF_LENGTH;
        const length = endY - startY;
        const geometry = new THREE.CylinderGeometry(
            BASE_RADIUS,
            BASE_RADIUS,
            length,
            SHEATH_RADIAL,
            SHEATH_SEGMENTS,
            true
        );

        // Shift so the cylinder spans startY → endY on local Y.
        geometry.translate( 0, startY + length * 0.5, 0 );

        this.sheathMaterial = createSheathMaterial();
        this.sheathMaterial.uniforms.startY.value = startY;
        this.sheathMaterial.uniforms.lengthY.value = length;

        this.sheath = new THREE.Mesh( geometry, this.sheathMaterial );
        this.sheath.name = 'AfterburnerSheath';
        this.sheath.renderOrder = 999;
        this.sheath.frustumCulled = false;
        this.container.add( this.sheath );
    }

    setVisible( visible ) {
        this.visible = visible;
        this.container.visible = visible;
    }

    /**
     * @param {number} speed Absolute airspeed in sim units (HUD km/h ≈ speed × 60).
     * @param {number} blend Afterburner crossfade 0–1.
     * @param {number} topSpeedT 0 at cruise, 1 at maxForward.
     */
    update( speed, blend, topSpeedT = 0 ) {
        const kmh = speed * 240;
        let cycleRate = 0;
        let pulse = 0;
        let opacity = 0;
        let scalePulse = 1;
        let i = 0;
        let diamond = null;
        let warmT = 0;
        let blueT = 0;
        let topRamp = Math.max( 0, Math.min( 1, topSpeedT ) );
        let crawl = 0;
        let radius = 0;

        if ( blend < 0.01 ) {
            if ( this.visible ) {
                this.setVisible( false );
            }
            return;
        }

        if ( ! this.visible ) {
            this.setVisible( true );
        }

        // Palette: orange → red through 400–800, then toward blue above 800.
        if ( kmh < 400 ) {
            this._warm.copy( this._orange );
            this._cool.set( 0.55, 0.7, 1.0 );
            this._core.set( 1.0, 0.9, 0.75 );
            this._sheathColour.set( 0.7, 0.45, 0.25 );
        }
        else if ( kmh < 800 ) {
            warmT = ( kmh - 400 ) / 400;
            this._warm.copy( this._orange ).lerp( this._red, warmT );
            this._cool.set( 0.45, 0.72, 1.0 ).lerp( this._blue, warmT * 0.5 );
            this._core.set( 1.0, 0.92, 0.85 ).lerp( new THREE.Color( 1.0, 0.75, 0.9 ), warmT );
            this._sheathColour.set( 0.65, 0.4, 0.3 ).lerp( new THREE.Color( 0.45, 0.55, 0.95 ), warmT );
        }
        else {
            blueT = Math.min( 1, ( kmh - 800 ) / 200 );
            this._warm.copy( this._red ).lerp( new THREE.Color( 0.85, 0.35, 0.55 ), blueT );
            this._cool.copy( this._blue );
            this._core.set( 1.0, 0.85, 0.95 ).lerp( new THREE.Color( 0.85, 0.95, 1.0 ), blueT );
            this._sheathColour.set( 0.4, 0.55, 1.0 ).lerp( new THREE.Color( 0.35, 0.7, 1.0 ), blueT );
        }

        cycleRate = 2.2 + Math.min( 4, speed * 0.35 );
        if ( kmh > 800 ) {
            cycleRate += 1.5;
        }
        cycleRate *= 2 * ( 1 + topRamp );
        this.phase += cycleRate * ( 1 / 60 );

        // Mild axial crawl so cells feel like flowing gas, not fixed beads.
        crawl = ( this.phase * 0.08 ) % DIAMOND_PITCH;

        for ( i = 0; i < this.diamonds.length; i++ ) {
            diamond = this.diamonds[ i ];
            pulse = 0.55 + 0.45 * Math.sin( this.phase - i * 0.85 );
            opacity = diamond.baseOpacity * blend * pulse;
            scalePulse = 0.88 + 0.18 * pulse;
            radius = BASE_RADIUS * diamond.baseScale * scalePulse;

            diamond.group.position.y = diamond.centreY + crawl * 0.35;

            diamond.leadingMat.uniforms.warmColour.value.copy( this._warm );
            diamond.leadingMat.uniforms.coolColour.value.copy( this._cool );
            diamond.leadingMat.uniforms.coreColour.value.copy( this._core );
            diamond.leadingMat.uniforms.opacity.value = opacity;

            diamond.trailingMat.uniforms.warmColour.value.copy( this._warm );
            diamond.trailingMat.uniforms.coolColour.value.copy( this._cool );
            diamond.trailingMat.uniforms.coreColour.value.copy( this._core );
            diamond.trailingMat.uniforms.opacity.value = opacity * 0.92;

            diamond.leading.scale.set( radius, HALF_LENGTH * ( 0.95 + 0.1 * pulse ), radius );
            diamond.trailing.scale.set( radius, HALF_LENGTH * ( 0.95 + 0.1 * pulse ), radius );
        }

        if ( this.sheathMaterial ) {
            this.sheathMaterial.uniforms.opacity.value = 0.32 * blend * ( 0.7 + 0.3 * Math.sin( this.phase * 0.5 ) );
            this.sheathMaterial.uniforms.sheathColour.value.copy( this._sheathColour );
            this.sheathMaterial.uniforms.breath.value = topRamp;
            this.sheathMaterial.uniforms.phase.value = this.phase;
            this.sheathMaterial.uniforms.pinch.value = 0.38 + topRamp * 0.06;
            this.sheathMaterial.uniforms.bulge.value = 1.0 + topRamp * 0.12;
        }
    }

}
