/**
 * Langenium crystal items — charge, capacity, and display helpers.
 */

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
