/**
 * @name            PersonInventoryButton
 * @description     Person-mode inventory toggle parked on the game overlay
 * @namespace       l.ui.inventory.personButton
 * @memberof        l.ui.inventory
 */

/**
 * Person mode has no flight HUD, so park a matching inventory button
 * on the game overlay while the player is on foot indoors.
 * Owned by person lifecycle (Player.setMode), not the hangar route.
 */
export default class PersonInventoryButton {

    inventory;
    element;

    constructor( inventory ) {
        this.inventory = inventory;
        this.element = null;
    }

    show() {
        const overlay = document.querySelector( '#game_overlay' );
        if ( ! overlay ) {
            return;
        }

        if ( ! this.element ) {
            const button = document.createElement( 'button' );
            button.type = 'button';
            button.className = 'inventory-button person-inventory-button';
            button.dataset.action = 'toggle-inventory';
            button.setAttribute( 'aria-label', 'Inventory' );

            const contents = document.querySelector( '#templates #inventory_button_contents' );
            if ( contents ) {
                button.appendChild( contents.content.cloneNode( true ) );
            }

            button.addEventListener( 'click', ( event ) => {
                event.preventDefault();
                this.inventory.toggleAircraftInventory();
            } );
            this.element = button;
            overlay.appendChild( button );
        }

        this.element.hidden = false;
    }

    hide() {
        if ( this.element ) {
            this.element.hidden = true;
        }
    }

}
