/**
 * Overworld crystal field — seeded surface pickups streamed around the aircraft.
 */

import Inventory from '../items/inventory';
import {
    createLangeniumCrystal,
    DEFAULT_CAPACITY,
    rollWeightedCharge,
} from '../items/langeniumCrystal';
import { ItemInstance } from '../items/types';

export const CELL_SIZE = 10000;
export const PICKUP_RADIUS = 100;
export const SPAWN_CHANCE = 0.4;
export const STREAM_RADIUS = 25000;
export const EXCLUSION_RADIUS = 4000;

export interface CrystalSpawn {
    cellKey: string;
    cellX: number;
    cellZ: number;
    x: number;
    y: number;
    z: number;
    charge: number;
}

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

export default class CrystalField {

    public readonly collected: Set<string> = new Set();

    private exclusions: ExclusionZone[];
    private chargeByCell: Map<string, number> = new Map();

    constructor( exclusions: ExclusionZone[] = DEFAULT_EXCLUSIONS ) {
        this.exclusions = exclusions;
    }

    /**
     * Stable cell identity from integer cell coordinates.
     */
    cellKey( cellX: number, cellZ: number ): string {
        return cellX + ':' + cellZ;
    }

    /**
     * Crystals that should exist near the aircraft this frame.
     */
    streamAround( aircraftX: number, aircraftZ: number ): CrystalSpawn[] {
        const cellRadius = Math.ceil( STREAM_RADIUS / CELL_SIZE );
        const originCellX = Math.floor( aircraftX / CELL_SIZE );
        const originCellZ = Math.floor( aircraftZ / CELL_SIZE );
        const streamRadiusSq = STREAM_RADIUS * STREAM_RADIUS;
        const spawns: CrystalSpawn[] = [];

        for ( let dz = -cellRadius; dz <= cellRadius; dz++ ) {
            for ( let dx = -cellRadius; dx <= cellRadius; dx++ ) {
                const cellX = originCellX + dx;
                const cellZ = originCellZ + dz;
                const spawn = this.spawnForCell( cellX, cellZ );
                if ( ! spawn ) {
                    continue;
                }

                const offsetX = spawn.x - aircraftX;
                const offsetZ = spawn.z - aircraftZ;
                if ( offsetX * offsetX + offsetZ * offsetZ > streamRadiusSq ) {
                    continue;
                }

                spawns.push( spawn );
            }
        }

        return spawns;
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

        if ( inventory.firstEmpty() === -1 ) {
            return null;
        }

        const pickupRadiusSq = PICKUP_RADIUS * PICKUP_RADIUS;
        let nearest: CrystalSpawn | null = null;
        let nearestDistSq = Infinity;

        const candidates = this.streamAround( aircraftX, aircraftZ );
        for ( const spawn of candidates ) {
            const dx = spawn.x - aircraftX;
            const dy = spawn.y - aircraftY;
            const dz = spawn.z - aircraftZ;
            const distSq = dx * dx + dy * dy + dz * dz;
            if ( distSq > pickupRadiusSq || distSq >= nearestDistSq ) {
                continue;
            }
            nearest = spawn;
            nearestDistSq = distSq;
        }

        if ( ! nearest ) {
            return null;
        }

        const item = createLangeniumCrystal( {
            charge: nearest.charge,
            capacity: DEFAULT_CAPACITY,
        } );

        const slot = inventory.place( item );
        if ( slot < 0 ) {
            return null;
        }

        this.collected.add( nearest.cellKey );
        this.chargeByCell.delete( nearest.cellKey );
        return item;
    }

    /**
     * Deterministic crystal for a cell, or null when empty / collected / excluded.
     */
    private spawnForCell( cellX: number, cellZ: number ): CrystalSpawn | null {
        const key = this.cellKey( cellX, cellZ );
        if ( this.collected.has( key ) ) {
            return null;
        }

        const chanceRoll = hash01( cellX, cellZ, 1 );
        if ( chanceRoll >= SPAWN_CHANCE ) {
            return null;
        }

        const jitterX = hash01( cellX, cellZ, 2 );
        const jitterZ = hash01( cellX, cellZ, 3 );
        const x = ( cellX + jitterX ) * CELL_SIZE;
        const z = ( cellZ + jitterZ ) * CELL_SIZE;
        const y = 0;

        if ( this.isExcluded( x, z ) ) {
            return null;
        }

        let charge = this.chargeByCell.get( key );
        if ( charge === undefined ) {
            // Roll once and cache so a crystal keeps its charge while streamed.
            charge = rollWeightedCharge( DEFAULT_CAPACITY );
            this.chargeByCell.set( key, charge );
        }

        return {
            cellKey: key,
            cellX,
            cellZ,
            x,
            y,
            z,
            charge,
        };
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
