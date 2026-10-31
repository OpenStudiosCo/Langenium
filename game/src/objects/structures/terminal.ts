/**
 * Indoor computer terminal.
 *
 * Interactive prop placed in hangars (and later other interiors).
 * Owns storage access between the player's location inventory and
 * aircraft cargo — the client displays results of these intents.
 */

import Inventory from '../../items/inventory';

type BagOwner = {
    inventory: Inventory;
};

export default class Terminal {

    /**
     * Resolve the two bags the computer can operate on.
     */
    bagsFor( person: BagOwner | null | undefined, aircraft: BagOwner | null | undefined ): {
        location: Inventory;
        aircraft: Inventory;
    } | null {
        if ( ! person || ! person.inventory || ! aircraft || ! aircraft.inventory ) {
            return null;
        }

        return {
            location: person.inventory,
            aircraft: aircraft.inventory,
        };
    }

    /**
     * Swap (or move into empty) one slot between two bags.
     */
    transferSlot(
        from: Inventory,
        fromIndex: number,
        to: Inventory,
        toIndex: number
    ): boolean {
        return from.transferTo( fromIndex, to, toIndex );
    }

    /**
     * Move a slot into the first empty slot of another bag.
     */
    transferToFirstEmpty(
        from: Inventory,
        fromIndex: number,
        to: Inventory
    ): boolean {
        return from.transferToFirstEmpty( fromIndex, to );
    }

    /**
     * Split a stack within one bag.
     */
    splitStack( inventory: Inventory, index: number ): boolean {
        return inventory.split( index );
    }

    /**
     * Remove (delete) a slot's contents.
     */
    removeItem( inventory: Inventory, index: number ): boolean {
        return inventory.remove( index ) !== null;
    }

}
