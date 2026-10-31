/**
 * @name            Item icons
 * @description     Resolve item icon URLs from type and charge state
 * @namespace       l.ui
 * @memberof        l.ui
 */

/**
 * Internal libs and helpers.
 */
import {
    LANGENIUM_CRYSTAL_ID,
    chargeState,
} from '#/game/src/items/langeniumCrystal';

/**
 * Path under /assets for an item's icon, or null when none applies.
 */
export function itemIconUrl( item ) {
    if ( ! item || ! item.id ) {
        return null;
    }

    if ( item.id === LANGENIUM_CRYSTAL_ID ) {
        const state = chargeState( item );
        return '/assets/item_icons/' + item.id + '/' + state + '.webp';
    }

    return null;
}
