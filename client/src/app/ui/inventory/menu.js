/**
 * @name            InventoryMenu
 * @description     Item context menu open, position and actions
 * @namespace       l.ui.inventory.menu
 * @memberof        l.ui.inventory
 */

/**
 * Owns menuTarget and drives transfer / split / delete through parent intents.
 */
export default class InventoryMenu {

    ui;
    target;

    constructor( ui ) {
        this.ui = ui;
        this.target = null;
    }

    open( bag, index, x, y ) {
        const inventory = this.ui.intents.getBag( bag );
        const item = inventory && inventory.get( index );
        if ( ! item ) {
            return;
        }

        this.target = { bag, index };
        this.ui.selected = { bag, index };

        const menu = this.ui.menu;
        const transferButton = menu.querySelector( '[data-menu="transfer"]' );
        const splitButton = menu.querySelector( '[data-menu="split"]' );
        const neighbour = this.ui.intents.otherBag( bag );
        const neighbourBag = this.ui.intents.getBag( neighbour );

        // Transfer only makes sense when both windows are on screen.
        transferButton.hidden = this.ui.mode !== 'transfer' || ! neighbourBag;
        transferButton.textContent = neighbour === 'location'
            ? 'Transfer to hangar'
            : 'Transfer to aircraft';
        splitButton.disabled = inventory.qtyOf( item ) < 2;
        splitButton.hidden = false;

        menu.hidden = false;

        const pad = 8;
        const rect = menu.getBoundingClientRect();
        const left = Math.min( x, window.innerWidth - rect.width - pad );
        const top = Math.min( y, window.innerHeight - rect.height - pad );
        menu.style.left = Math.max( pad, left ) + 'px';
        menu.style.top = Math.max( pad, top ) + 'px';

        this.ui.contents.render();
    }

    hide() {
        this.ui.menu.hidden = true;
        this.target = null;
    }

    runAction( action ) {
        if ( ! this.target ) {
            this.hide();
            return;
        }

        const { bag, index } = this.target;
        const inventory = this.ui.intents.getBag( bag );
        if ( ! inventory ) {
            this.hide();
            return;
        }

        if ( action === 'transfer' ) {
            const neighbour = this.ui.intents.getBag( this.ui.intents.otherBag( bag ) );
            if ( neighbour ) {
                this.ui.intents.transferToFirstEmpty( inventory, index, neighbour );
            }
        }
        else if ( action === 'split' ) {
            this.ui.intents.split( inventory, index );
        }
        else if ( action === 'delete' ) {
            this.ui.intents.remove( inventory, index );
            this.ui.selected = null;
        }

        this.hide();
        this.ui.contents.render();
    }

}
