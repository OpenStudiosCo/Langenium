/**
 * Crystal Field System
 *
 * Seeds floating crystals across the overworld on a deterministic cell grid,
 * streams those near an aircraft and harvests them into its bag on contact.
 *
 * Owned by World rather than a vehicle. Presentation reads crystal positions
 * from here and does not decide where crystals exist.
 */

import BaseSystem from './base';
import FloatingCrystal from '../objects/floatingCrystal';
import Inventory from '../items/inventory';
import {
    DEFAULT_CAPACITY,
    rollWeightedCharge,
} from '../items/langeniumCrystal';
import { ItemInstance } from '../items/types';

export const CELL_SIZE = 10000;
export const PICKUP_RADIUS = 100;
export const SPAWN_CHANCE = 0.4;
export const STREAM_RADIUS = 25000;
export const EXCLUSION_RADIUS = 4000;

interface ExclusionZone {
    x: number;
    z: number;
    radius: number;
}

// Lambda City and nearby refineries — keep crystals off structure decks.
const DEFAULT_EXCLUSIONS: ExclusionZone[] = [
    { x: -35000, z: -65000, radius: EXCLUSION_RADIUS },
    { x: 20000, z: -20000, radius: EXCLUSION_RADIUS * 0.5 },
    { x: -20000, z: 20000, radius: EXCLUSION_RADIUS * 0.5 },
];

export default class CrystalField extends BaseSystem {

    public readonly collected: Set<string> = new Set();

    private exclusions: ExclusionZone[];

    // Seeded crystals kept per cell so each keeps its charge while streamed.
    private crystalsByCell: Map<string, FloatingCrystal> = new Map();

    constructor( exclusions: ExclusionZone[] = DEFAULT_EXCLUSIONS ) {
        super();

        this.exclusions = exclusions;
    }

    /**
     * Stable cell identity from integer cell coordinates.
     */
    cellKey( cellX: number, cellZ: number ): string {
        return cellX + ':' + cellZ;
    }

    /**
     * Whether a cell's crystal has already been harvested.
     */
    isCollected( cellKey: string ): boolean {
        return this.collected.has( cellKey );
    }

    /**
     * Crystals that should exist near the aircraft this frame.
     */
    streamAround( aircraftX: number, aircraftZ: number ): FloatingCrystal[] {
        const cellRadius = Math.ceil( STREAM_RADIUS / CELL_SIZE );
        const originCellX = Math.floor( aircraftX / CELL_SIZE );
        const originCellZ = Math.floor( aircraftZ / CELL_SIZE );
        const streamRadiusSq = STREAM_RADIUS * STREAM_RADIUS;
        const crystals: FloatingCrystal[] = [];

        for ( let dz = -cellRadius; dz <= cellRadius; dz++ ) {
            for ( let dx = -cellRadius; dx <= cellRadius; dx++ ) {
                const cellX = originCellX + dx;
                const cellZ = originCellZ + dz;
                const crystal = this.crystalForCell( cellX, cellZ );
                if ( ! crystal ) {
                    continue;
                }

                const offsetX = crystal.position.x - aircraftX;
                const offsetZ = crystal.position.z - aircraftZ;
                if ( offsetX * offsetX + offsetZ * offsetZ > streamRadiusSq ) {
                    continue;
                }

                crystals.push( crystal );
            }
        }

        return crystals;
    }

    /**
     * Pick up the nearest in-range crystal into the aircraft bag.
     * Returns the placed item, or null when nothing was collected.
     */
    tryPickup(
        inventory: Inventory,
        aircraftX: number,
        aircraftY: number,
        aircraftZ: number
    ): ItemInstance | null {
        if ( ! inventory ) {
            return null;
        }

        const pickupRadiusSq = PICKUP_RADIUS * PICKUP_RADIUS;
        let nearest: FloatingCrystal | null = null;
        let nearestDistSq = Infinity;

        const candidates = this.streamAround( aircraftX, aircraftZ );
        for ( const crystal of candidates ) {
            const dx = crystal.position.x - aircraftX;
            const dy = crystal.position.y - aircraftY;
            const dz = crystal.position.z - aircraftZ;
            const distSq = dx * dx + dy * dy + dz * dz;
            if ( distSq > pickupRadiusSq || distSq >= nearestDistSq ) {
                continue;
            }
            nearest = crystal;
            nearestDistSq = distSq;
        }

        if ( ! nearest ) {
            return null;
        }

        const item = nearest.harvest();
        const slot = inventory.place( item );
        if ( slot < 0 ) {
            return null;
        }

        this.collected.add( nearest.cellKey );
        this.crystalsByCell.delete( nearest.cellKey );
        return item;
    }

    /**
     * Deterministic crystal for a cell, or null when empty / collected / excluded.
     */
    private crystalForCell( cellX: number, cellZ: number ): FloatingCrystal | null {
        const key = this.cellKey( cellX, cellZ );
        if ( this.collected.has( key ) ) {
            return null;
        }

        const seeded = this.crystalsByCell.get( key );
        if ( seeded ) {
            return seeded;
        }

        const chanceRoll = hash01( cellX, cellZ, 1 );
        if ( chanceRoll >= SPAWN_CHANCE ) {
            return null;
        }

        const jitterX = hash01( cellX, cellZ, 2 );
        const jitterZ = hash01( cellX, cellZ, 3 );
        const position = {
            x: ( cellX + jitterX ) * CELL_SIZE,
            y: 0,
            z: ( cellZ + jitterZ ) * CELL_SIZE,
        };

        if ( this.isExcluded( position.x, position.z ) ) {
            return null;
        }

        const charge = rollWeightedCharge( DEFAULT_CAPACITY );
        const crystal = new FloatingCrystal( key, cellX, cellZ, position, charge );
        this.crystalsByCell.set( key, crystal );
        return crystal;
    }

    private isExcluded( x: number, z: number ): boolean {
        for ( const zone of this.exclusions ) {
            const dx = x - zone.x;
            const dz = z - zone.z;
            const radius = zone.radius;
            if ( dx * dx + dz * dz <= radius * radius ) {
                return true;
            }
        }
        return false;
    }

}

/**
 * Fractional hash in [0, 1) from cell coords and a salt lane.
 */
function hash01( cellX: number, cellZ: number, salt: number ): number {
    let n = ( cellX * 374761393 ) ^ ( cellZ * 668265263 ) ^ ( salt * 982451653 );
    n = ( n ^ ( n >>> 13 ) ) * 1274126177;
    n = n ^ ( n >>> 16 );
    return ( n >>> 0 ) / 4294967296;
}
