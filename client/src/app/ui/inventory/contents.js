/**
 * @name            InventoryContents
 * @description     Slot grids, detail pane, labels and icons
 * @namespace       l.ui.inventory.contents
 * @memberof        l.ui.inventory
 */

import { itemIconUrl } from '@/ui/item_icon.js';
import { formatPower } from '#/game/src/items/langeniumCrystal';

/**
 * Paints inventory windows from modal bag state and selection on the parent UI.
 */
export default class InventoryContents {

    ui;

    constructor( ui ) {
        this.ui = ui;
    }

    itemLabel( inventory, item ) {
        if ( ! item ) {
            return 'Empty';
        }
        const qty = inventory ? inventory.qtyOf( item ) : 1;
        return qty > 1 ? ( item.name + ' ×' + qty ) : item.name;
    }

    /**
     * Icon and optional qty badge for a slot or drag ghost.
     */
    fillSlotContents( el, inventory, item ) {
        if ( ! item ) {
            return;
        }

        const iconUrl = itemIconUrl( item );
        if ( iconUrl ) {
            const icon = document.createElement( 'img' );
            icon.className = 'item_slot_icon';
            icon.src = iconUrl;
            icon.alt = '';
            icon.draggable = false;
            el.appendChild( icon );
        }

        const qty = inventory ? inventory.qtyOf( item ) : 0;
        if ( qty > 1 ) {
            const qtyMark = document.createElement( 'span' );
            qtyMark.className = 'item_slot_qty';
            qtyMark.textContent = '×' + qty;
            el.appendChild( qtyMark );
        }
    }

    renderGrid( grid, bag, inventory ) {
        grid.innerHTML = '';
        if ( ! inventory ) {
            return;
        }

        for ( let i = 0; i < inventory.size; i++ ) {
            const item = inventory.get( i );
            const isSelected = this.ui.selected
                && this.ui.selected.bag === bag
                && this.ui.selected.index === i;

            const button = document.createElement( 'button' );
            button.type = 'button';
            button.className = 'item_slot'
                + ( item ? '' : ' empty' )
                + ( isSelected ? ' selected' : '' );
            button.dataset.bag = bag;
            button.dataset.slot = String( i );
            button.setAttribute(
                'aria-label',
                item ? this.itemLabel( inventory, item ) : 'Empty slot'
            );

            if ( item ) {
                this.fillSlotContents( button, inventory, item );
            }

            grid.appendChild( button );
        }
    }

    renderDetail( el, attrEl, bag ) {
        if ( this.ui.selected && this.ui.selected.bag === bag ) {
            const inventory = this.ui.intents.getBag( bag );
            const item = inventory ? inventory.get( this.ui.selected.index ) : null;
            el.textContent = item ? this.itemLabel( inventory, item ) : 'Empty slot';

            const power = item ? formatPower( item ) : null;
            if ( attrEl ) {
                if ( power ) {
                    attrEl.hidden = false;
                    attrEl.textContent = power;
                }
                else {
                    attrEl.hidden = true;
                    attrEl.textContent = '';
                }
            }
            return;
        }

        el.textContent = 'Empty slot';
        if ( attrEl ) {
            attrEl.hidden = true;
            attrEl.textContent = '';
        }
    }

    render() {
        const ui = this.ui;

        if ( ui.mode === 'transfer' ) {
            this.renderGrid( ui.locationGrid, 'location', ui.locationInventory );
            this.renderDetail( ui.locationDetail, ui.locationDetailAttr, 'location' );
        }
        else {
            ui.locationGrid.innerHTML = '';
            ui.locationDetail.textContent = 'Empty slot';
            if ( ui.locationDetailAttr ) {
                ui.locationDetailAttr.hidden = true;
                ui.locationDetailAttr.textContent = '';
            }
        }

        this.renderGrid( ui.aircraftGrid, 'aircraft', ui.aircraftInventory );
        this.renderDetail( ui.aircraftDetail, ui.aircraftDetailAttr, 'aircraft' );
    }

}
