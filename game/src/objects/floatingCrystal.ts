/**
 * Floating crystal — a Langenium crystal resting on the ocean surface.
 *
 * The world form of a crystal. Seeded and streamed by the crystal field
 * system; becomes a Langenium crystal item when harvested into a bag.
 */

import ObjectBase from './base';
import {
    createLangeniumCrystal,
    DEFAULT_CAPACITY,
} from '../items/langeniumCrystal';
import { ItemInstance } from '../items/types';
import { Vec3 } from '../types';

export default class FloatingCrystal extends ObjectBase {

    // Field cell this crystal was seeded in; stable identity across streaming.
    public readonly cellKey: string;
    public readonly cellX: number;
    public readonly cellZ: number;

    // Stored power in MWh.
    public readonly charge: number;

    constructor( cellKey: string, cellX: number, cellZ: number, position: Vec3, charge: number ) {
        super();

        this.cellKey = cellKey;
        this.cellX = cellX;
        this.cellZ = cellZ;
        this.charge = charge;

        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }

    /**
     * The inventory item this crystal becomes when collected.
     */
    harvest(): ItemInstance {
        return createLangeniumCrystal( {
            charge: this.charge,
            capacity: DEFAULT_CAPACITY,
        } );
    }

}
