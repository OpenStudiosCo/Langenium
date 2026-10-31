/**
 * Fixed-slot inventory bag for cargo holds and facility storage.
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

            this.set( index, this.cloneItem( entry ) );
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

    /**
     * Whether two stacks may combine. Same id is required; charge and
     * capacity must also match when either side carries them.
     */
    stacksWith( a: ItemInstance | null, b: ItemInstance | null ): boolean {
        if ( ! a || ! b ) {
            return false;
        }
        if ( a.id !== b.id ) {
            return false;
        }
        if ( a.charge !== b.charge ) {
            return false;
        }
        if ( a.capacity !== b.capacity ) {
            return false;
        }
        return true;
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
     * Move or merge this bag's slot into another bag's slot.
     * Compatible stacks combine; otherwise the slots swap.
     * Either side may be empty — that is how drag-to-empty works.
     */
    transferTo( fromIndex: number, toInventory: Inventory, toIndex: number ): boolean {
        if ( fromIndex < 0 || fromIndex >= this.slots.length ) {
            return false;
        }
        if ( toIndex < 0 || toIndex >= toInventory.slots.length ) {
            return false;
        }

        // Same slot is a no-op.
        if ( this === toInventory && fromIndex === toIndex ) {
            return false;
        }

        const fromItem = this.slots[ fromIndex ];
        const toItem = toInventory.slots[ toIndex ];

        if ( fromItem && toItem && this.stacksWith( fromItem, toItem ) ) {
            toItem.qty = this.qtyOf( toItem ) + this.qtyOf( fromItem );
            this.slots[ fromIndex ] = null;
            return true;
        }

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
        this.slots[ dest ] = this.cloneItem( item, move );
        return true;
    }

    /**
     * Copy an item, optionally overriding qty. Preserves charge / capacity.
     */
    cloneItem( entry: any, qty?: number ): ItemInstance {
        const item: ItemInstance = {
            id: entry.id,
            name: entry.name || entry.id,
        };

        const nextQty = qty !== undefined
            ? qty
            : ( entry.qty !== undefined ? entry.qty : undefined );
        if ( nextQty !== undefined ) {
            item.qty = nextQty;
        }
        if ( entry.charge !== undefined ) {
            item.charge = entry.charge;
        }
        if ( entry.capacity !== undefined ) {
            item.capacity = entry.capacity;
        }

        return item;
    }

}
