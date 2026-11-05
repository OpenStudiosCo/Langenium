/**
 * Langenium crystal items — charge, capacity, and display helpers.
 */

import Inventory from './inventory';
import { ItemInstance } from './types';

export const LANGENIUM_CRYSTAL_ID = 'langenium_crystal';
export const LANGENIUM_CRYSTAL_NAME = 'Langenium Crystal';
export const DEFAULT_CAPACITY = 10;

export type CrystalChargeState = 'empty' | 'charged' | 'full';

/**
 * Build a crystal instance. Charge defaults to capacity (full).
 */
export function createLangeniumCrystal( options: {
    charge?: number;
    capacity?: number;
    qty?: number;
} = {} ): ItemInstance {
    const capacity = options.capacity !== undefined
        ? Math.max( 0, Math.floor( options.capacity ) )
        : DEFAULT_CAPACITY;
    const charge = options.charge !== undefined
        ? Math.max( 0, Math.min( capacity, options.charge ) )
        : capacity;

    const item: ItemInstance = {
        id: LANGENIUM_CRYSTAL_ID,
        name: LANGENIUM_CRYSTAL_NAME,
        charge,
        capacity,
    };

    if ( options.qty !== undefined ) {
        item.qty = Math.max( 1, Math.floor( options.qty ) );
    }

    return item;
}

/**
 * Icon / presentation state from remaining charge.
 */
export function chargeState( item: ItemInstance | null | undefined ): CrystalChargeState {
    if ( ! item ) {
        return 'empty';
    }

    const capacity = item.capacity === undefined ? 0 : item.capacity;
    const charge = item.charge === undefined ? 0 : item.charge;

    if ( charge <= 0 ) {
        return 'empty';
    }
    if ( capacity > 0 && charge >= capacity ) {
        return 'full';
    }
    return 'charged';
}

/**
 * Format charge / capacity for the item detail strip.
 * Whole MWh stay compact (5 / 10 MWh); fractions keep up to three places.
 */
export function formatPower( item: ItemInstance | null | undefined ): string | null {
    if ( ! item || item.capacity === undefined ) {
        return null;
    }

    const capacity = Math.max( 0, item.capacity );
    const charge = item.charge === undefined
        ? 0
        : Math.max( 0, Math.min( capacity, item.charge ) );

    return formatPowerValue( charge ) + ' / ' + formatPowerValue( capacity ) + ' MWh';
}

/**
 * Whole numbers stay compact; fractional MWh keep up to three places.
 */
function formatPowerValue( value: number ): string {
    const whole = Number.isInteger( value );
    return value.toLocaleString( 'en-GB', {
        minimumFractionDigits: 0,
        maximumFractionDigits: whole ? 0 : 3,
    } );
}

function isCrystal( item: ItemInstance | null | undefined ): boolean {
    return !! item && item.id === LANGENIUM_CRYSTAL_ID;
}

function slotCharge( item: ItemInstance ): number {
    if ( item.charge === undefined ) {
        return 0;
    }
    return Math.max( 0, item.charge );
}

function slotCapacity( item: ItemInstance ): number {
    if ( item.capacity === undefined ) {
        return 0;
    }
    return Math.max( 0, item.capacity );
}

/**
 * Sum remaining charge across crystal slots.
 * Charge is per-stack (not multiplied by qty); only one unit drains at a time.
 */
export function totalCharge( inventory: Inventory ): number {
    let total = 0;

    for ( let i = 0; i < inventory.size; i++ ) {
        const item = inventory.get( i );
        if ( ! isCrystal( item ) ) {
            continue;
        }
        total += slotCharge( item );
    }

    return total;
}

/**
 * Prefer a partially drained crystal already in use; otherwise the first with charge.
 */
export function findDrainSlot( inventory: Inventory ): number {
    let firstCharged = -1;

    for ( let i = 0; i < inventory.size; i++ ) {
        const item = inventory.get( i );
        if ( ! isCrystal( item ) ) {
            continue;
        }

        const charge = slotCharge( item );
        if ( charge <= 0 ) {
            continue;
        }

        const capacity = slotCapacity( item );
        if ( capacity > 0 && charge < capacity ) {
            return i;
        }

        if ( firstCharged === -1 ) {
            firstCharged = i;
        }
    }

    return firstCharged;
}

/**
 * Drain up to mwhNeeded from a single crystal into the capacitor budget.
 * Peels one unit from a stack first; skips the tick when the bag is full.
 * Returns MWh actually taken.
 */
export function drainIntoCapacitor( inventory: Inventory, mwhNeeded: number ): number {
    if ( mwhNeeded <= 0 ) {
        return 0;
    }

    let slot = findDrainSlot( inventory );
    if ( slot < 0 ) {
        return 0;
    }

    let item = inventory.get( slot );
    if ( ! item ) {
        return 0;
    }

    if ( inventory.qtyOf( item ) >= 2 ) {
        const dest = inventory.takeOne( slot );
        if ( dest < 0 ) {
            return 0;
        }
        slot = dest;
        item = inventory.get( slot );
        if ( ! item ) {
            return 0;
        }
    }

    const charge = slotCharge( item );
    const taken = Math.min( charge, mwhNeeded );
    const remaining = charge - taken;
    item.charge = remaining > 0 ? remaining : 0;

    // Depleted crystals fold into any matching empty stack.
    if ( item.charge <= 0 ) {
        inventory.mergeWithCompatible( slot );
    }

    return taken;
}
