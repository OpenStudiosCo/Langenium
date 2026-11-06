/**
 * Overworld floating crystal pickups — scenograph over World crystal positions.
 */

import * as THREE from 'three';

import l from '@/helpers/l.js';
import { getCrystalGlowTexture } from '@/scenograph/materials.js';
import { DEFAULT_CAPACITY } from '#/game/src/items/langeniumCrystal';

const CRYSTAL_SIZE = 6;
const BOB_AMPLITUDE = 0.8;
const BOB_SPEED = 1.6;
const SPIN_SPEED = 0.7;
const GLOW_MIN = 18;
const GLOW_MAX = 120;
const GLOW_DISTANCE_FACTOR = 0.035;

// Match langenium_crystal icon — dusty rose quartz.
const CRYSTAL_BODY_COLOUR = 0xf2c8d4;
const CRYSTAL_GLOW_COLOUR = 0xe8a0b4;
const CRYSTAL_LIGHT_COLOUR = 0xf0a8bc;

export default class CrystalField {

    instance;
    active;
    sharedGeometry;
    time;

    constructor() {
        this.instance = new THREE.Group();
        this.instance.name = 'Crystal Field';
        this.active = new Map();
        this.sharedGeometry = new THREE.OctahedronGeometry( CRYSTAL_SIZE, 0 );
        this.time = 0;
    }

    /**
     * Animate hook.
     *
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     *
     * @method animate
     * @memberof CrystalField
     * @global
     * @note All references within this method should be globally accessible.
     */
    animate( delta ) {
        const crystalField = l.current_scene.objects.crystalField;
        if ( ! crystalField ) {
            return;
        }

        if ( l.mode !== 'single_player' && l.mode !== 'multi_player' ) {
            crystalField.clearMeshes();
            return;
        }

        const world = l.current_scene.world;
        if ( ! world || ! world.crystalField ) {
            crystalField.clearMeshes();
            return;
        }

        const player = l.scenograph.actors.player;
        if ( ! player || ! player.vehicle || ! player.vehicle.mesh ) {
            crystalField.clearMeshes();
            return;
        }

        const aircraft = player.vehicle.mesh.userData.object;
        if ( ! aircraft || ! aircraft.inventory ) {
            crystalField.clearMeshes();
            return;
        }

        const position = player.vehicle.mesh.position;
        const dt = typeof delta === 'number' && delta > 0 ? delta : 1 / 60;
        crystalField.time += dt;

        const crystals = world.crystalField.streamAround( position.x, position.z );
        const seen = new Set();

        for ( const crystal of crystals ) {
            seen.add( crystal.cellKey );
            let entry = crystalField.active.get( crystal.cellKey );
            if ( ! entry ) {
                entry = crystalField.createMesh( crystal );
                crystalField.active.set( crystal.cellKey, entry );
                crystalField.instance.add( entry.mesh );
            }
            crystalField.updateMesh( entry, crystal, dt, position );
        }

        for ( const [ cellKey, entry ] of crystalField.active ) {
            if ( seen.has( cellKey ) ) {
                continue;
            }
            crystalField.disposeMesh( entry );
            crystalField.active.delete( cellKey );
        }

        const collected = world.crystalField.tryPickup(
            aircraft.inventory,
            position.x,
            position.y,
            position.z
        );

        if ( collected ) {
            if ( l.ui && l.ui.gameLog ) {
                l.ui.gameLog.appendItemEvent( 'Picked up', collected, 1 );
            }
            for ( const [ cellKey, entry ] of [ ...crystalField.active ] ) {
                if ( ! world.crystalField.isCollected( cellKey ) ) {
                    continue;
                }
                crystalField.disposeMesh( entry );
                crystalField.active.delete( cellKey );
            }
        }
    }

    createMesh( crystal ) {
        const fill = Math.max( 0, Math.min( 1, crystal.charge / DEFAULT_CAPACITY ) );
        const group = new THREE.Group();
        group.name = 'Floating Crystal';
        group.position.set( crystal.position.x, crystal.position.y + CRYSTAL_SIZE, crystal.position.z );
        group.userData.cellKey = crystal.cellKey;
        group.userData.baseY = crystal.position.y + CRYSTAL_SIZE;
        group.userData.phase = hashPhase( crystal.cellKey );

        // Draw after the transparent ocean (renderOrder 1) and stay on layer 0 so the
        // water mirror pass can reflect them; layer 11 also feeds bloom.
        group.renderOrder = 2;

        const bodyMaterial = new THREE.MeshBasicMaterial( {
            color: new THREE.Color( CRYSTAL_BODY_COLOUR ),
            transparent: true,
            opacity: 0.85 + fill * 0.15,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        } );
        if ( 'toneMapped' in bodyMaterial ) {
            bodyMaterial.toneMapped = false;
        }

        const body = new THREE.Mesh( this.sharedGeometry, bodyMaterial );
        body.renderOrder = 2;
        body.layers.enable( 11 );
        group.add( body );

        const glowMaterial = new THREE.SpriteMaterial( {
            map: getCrystalGlowTexture(),
            color: new THREE.Color( CRYSTAL_GLOW_COLOUR ),
            transparent: true,
            opacity: 0.55 + fill * 0.35,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        } );
        if ( 'toneMapped' in glowMaterial ) {
            glowMaterial.toneMapped = false;
        }

        const glow = new THREE.Sprite( glowMaterial );
        glow.scale.setScalar( GLOW_MIN );
        glow.renderOrder = 2;
        glow.layers.enable( 11 );
        group.add( glow );

        const light = new THREE.PointLight( CRYSTAL_LIGHT_COLOUR, 2 + fill * 3, 180, 2 );
        light.position.set( 0, 1, 0 );
        light.layers.enable( 11 );
        group.add( light );

        return {
            mesh: group,
            body,
            glow,
            light,
            bodyMaterial,
            glowMaterial,
        };
    }

    updateMesh( entry, crystal, dt, aircraftPosition ) {
        const phase = entry.mesh.userData.phase || 0;
        const bob = Math.sin( this.time * BOB_SPEED + phase ) * BOB_AMPLITUDE;
        entry.mesh.position.x = crystal.position.x;
        entry.mesh.position.z = crystal.position.z;
        entry.mesh.position.y = entry.mesh.userData.baseY + bob;
        entry.body.rotation.y += SPIN_SPEED * dt;
        entry.body.rotation.x = Math.sin( this.time * 0.5 + phase ) * 0.2;

        const fill = crystal.charge / DEFAULT_CAPACITY;
        const pulse = 0.75 + 0.25 * Math.sin( this.time * 3.2 + phase );
        entry.bodyMaterial.opacity = ( 0.7 + fill * 0.25 ) * pulse;
        entry.glowMaterial.opacity = ( 0.45 + fill * 0.4 ) * pulse;
        entry.light.intensity = ( 2 + fill * 3 ) * pulse;

        // Grow the shimmer with distance so crystals stay spottable from altitude.
        const dx = crystal.position.x - aircraftPosition.x;
        const dy = crystal.position.y - aircraftPosition.y;
        const dz = crystal.position.z - aircraftPosition.z;
        const distance = Math.sqrt( dx * dx + dy * dy + dz * dz );
        const glowScale = Math.min(
            GLOW_MAX,
            Math.max( GLOW_MIN, distance * GLOW_DISTANCE_FACTOR )
        );
        entry.glow.scale.setScalar( glowScale );
    }

    disposeMesh( entry ) {
        if ( entry.mesh.parent ) {
            entry.mesh.parent.remove( entry.mesh );
        }
        if ( entry.bodyMaterial ) {
            entry.bodyMaterial.dispose();
        }
        if ( entry.glowMaterial ) {
            entry.glowMaterial.dispose();
        }
        // Geometry and glow texture are shared — do not dispose here.
    }

    clearMeshes() {
        for ( const entry of this.active.values() ) {
            this.disposeMesh( entry );
        }
        this.active.clear();
    }

}

function hashPhase( cellKey ) {
    let hash = 0;
    for ( let i = 0; i < cellKey.length; i++ ) {
        hash = ( ( hash << 5 ) - hash ) + cellKey.charCodeAt( i );
        hash |= 0;
    }
    return ( hash >>> 0 ) % 1000 / 1000 * Math.PI * 2;
}
