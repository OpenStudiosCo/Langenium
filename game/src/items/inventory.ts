/**
 * Fixed-slot inventory bag.
 *
 * Used for the player's inventory at their assigned location and for
 * aircraft cargo. Slots hold an ItemInstance or null. Stage 1 moves
 * stacks around; fuel cells and typed payloads come later.
 */

import { ItemInstance } from './types';

export default class Inventory {

    public slots: ( ItemInstance | null )[];

    constructor( size: number = 8 ) {
        const count = Math.max( 1, Math.floor( size ) );
        this.slots = new Array( count ).fill( null );
    }

    get size(): number {
        return this.slots.length;
    }

    get( index: number ): ItemInstance | null {
        if ( index < 0 || index >= this.slots.length ) {
            return null;
        }
        return this.slots[ index ];
    }

    set( index: number, item: ItemInstance | null ): boolean {
        if ( index < 0 || index >= this.slots.length ) {
            return false;
        }
        this.slots[ index ] = item;
        return true;
    }

    /**
     * Empty every slot.
     */
    clear(): void {
        for ( let i = 0; i < this.slots.length; i++ ) {
            this.slots[ i ] = null;
        }
    }

    /**
     * Replace bag contents from a serialised / YAML slot list.
     * Array order is the slot index; null / missing entries stay empty.
     * Grows the bag when the list is longer than the current size.
     */
    applySlots( items: any ): void {
        if ( ! Array.isArray( items ) ) {
            return;
        }

        const needed = Math.max( this.size, items.length );
        if ( needed !== this.size ) {
            this.slots = new Array( needed ).fill( null );
        }
        else {
            this.clear();
        }

        items.forEach( ( entry, index ) => {
            if ( ! entry || ! entry.id ) {
                return;
            }

            const item: ItemInstance = {
                id: entry.id,
                name: entry.name || entry.id,
            };
            if ( entry.qty !== undefined ) {
                item.qty = entry.qty;
            }
            this.set( index, item );
        } );
    }

    /**
     * How many units this stack represents. Missing qty means a singleton.
     */
    qtyOf( item: ItemInstance | null ): number {
        if ( ! item ) {
            return 0;
        }
        const qty = item.qty === undefined ? 1 : item.qty;
        return Math.max( 0, Math.floor( qty ) );
    }

    isEmpty( index: number ): boolean {
        return this.get( index ) === null;
    }

    firstEmpty(): number {
        return this.slots.findIndex( ( slot ) => slot === null );
    }

    remove( index: number ): ItemInstance | null {
        const item = this.get( index );
        if ( ! item ) {
            return null;
        }
        this.slots[ index ] = null;
        return item;
    }

    /**
     * Swap this bag's slot with another bag's slot.
     * Either side may be empty — that is how drag-to-empty works.
     */
    transferTo( fromIndex: number, toInventory: Inventory, toIndex: number ): boolean {
        if ( fromIndex < 0 || fromIndex >= this.slots.length ) {
            return false;
        }
        if ( toIndex < 0 || toIndex >= toInventory.slots.length ) {
            return false;
        }

        const fromItem = this.slots[ fromIndex ];
        const toItem = toInventory.slots[ toIndex ];
        this.slots[ fromIndex ] = toItem;
        toInventory.slots[ toIndex ] = fromItem;
        return true;
    }

    /**
     * Move this slot into the first free slot of another bag.
     * Used by the context-menu "Transfer to …" action.
     */
    transferToFirstEmpty( fromIndex: number, toInventory: Inventory ): boolean {
        const item = this.get( fromIndex );
        if ( ! item ) {
            return false;
        }

        const dest = toInventory.firstEmpty();
        if ( dest === -1 ) {
            return false;
        }

        toInventory.slots[ dest ] = item;
        this.slots[ fromIndex ] = null;
        return true;
    }

    /**
     * Peel half of a stack into the first free slot of this bag.
     * Odd counts leave the larger half where it was.
     */
    split( index: number ): boolean {
        const item = this.get( index );
        const qty = this.qtyOf( item );
        if ( ! item || qty < 2 ) {
            return false;
        }

        const dest = this.firstEmpty();
        if ( dest === -1 ) {
            return false;
        }

        const move = Math.floor( qty / 2 );
        const keep = qty - move;
        item.qty = keep;
        this.slots[ dest ] = {
            id: item.id,
            name: item.name,
            qty: move,
        };
        return true;
    }

}
