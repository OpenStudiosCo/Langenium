/**
 * @name            InventoryUI
 * @description     Location and aircraft storage windows
 * @namespace       l.ui.inventory
 * @memberof        l.ui
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import PersonInventoryButton from '@/ui/inventory/person_button.js';
import InventoryEvents from '@/ui/inventory/events.js';
import InventoryContents from '@/ui/inventory/contents.js';
import InventoryMenu from '@/ui/inventory/menu.js';
import InventoryIntents from '@/ui/inventory/intents.js';

export default class InventoryUI {

    container;
    locationWindow;
    aircraftWindow;
    locationGrid;
    aircraftGrid;
    locationDetail;
    aircraftDetail;
    locationDetailAttr;
    aircraftDetailAttr;
    menu;
    personButton;
    events;
    contents;
    menuUI;
    intents;

    // Modal open state and which bags are on screen.
    open;
    mode;
    locationInventory;
    aircraftInventory;
    selected;

    constructor() {

        this.container = document.querySelector( '#item_screen' );
        this.locationWindow = this.container.querySelector( '[data-window="location"]' );
        this.aircraftWindow = this.container.querySelector( '[data-window="aircraft"]' );
        this.locationGrid = this.container.querySelector( '[data-grid="location"]' );
        this.aircraftGrid = this.container.querySelector( '[data-grid="aircraft"]' );
        this.locationDetail = this.container.querySelector( '[data-detail="location"]' );
        this.aircraftDetail = this.container.querySelector( '[data-detail="aircraft"]' );
        this.locationDetailAttr = this.container.querySelector( '[data-detail-attr="location"]' );
        this.aircraftDetailAttr = this.container.querySelector( '[data-detail-attr="aircraft"]' );
        this.menu = this.container.querySelector( '.item_screen_menu' );

        this.open = false;
        this.mode = 'aircraft';
        this.locationInventory = null;
        this.aircraftInventory = null;
        this.selected = null;

        this.intents = new InventoryIntents( this );
        this.contents = new InventoryContents( this );
        this.menuUI = new InventoryMenu( this );
        this.personButton = new PersonInventoryButton( this );
        this.events = new InventoryEvents( this );

        this.container.addEventListener( 'click', ( event ) => this.events.onClick( event ) );
        this.container.addEventListener( 'contextmenu', ( event ) => this.events.onContextMenu( event ) );
        this.container.addEventListener( 'pointerdown', ( event ) => this.events.onPointerDown( event ) );
        this.container.addEventListener( 'pointermove', ( event ) => this.events.onPointerMove( event ) );
        this.container.addEventListener( 'pointerup', ( event ) => this.events.onPointerUp( event ) );
        this.container.addEventListener( 'pointercancel', ( event ) => this.events.onPointerCancel( event ) );

        document.addEventListener( 'keydown', ( event ) => this.events.onKeyDown( event ) );

    }

    isOpen() {
        return this.open;
    }

    /**
     * Freeze walk / flight controls while the storage modal is up.
     */
    blocksInput() {
        return this.open;
    }

    toggleAircraftInventory() {
        if ( this.isOpen() ) {
            this.hide();
            return;
        }
        this.openAircraftInventory();
    }

    showPersonButton() {
        this.personButton.show();
    }

    hidePersonButton() {
        this.personButton.hide();
    }

    /**
     * Open the modal over one or two bags.
     *
     * mode 'aircraft'  — single aircraft storage window
     * mode 'transfer'  — location + aircraft side by side
     */
    show( options ) {
        if ( ! options ) {
            return;
        }

        const mode = options.mode || 'aircraft';
        const transferReady = options.locationInventory && options.aircraftInventory;
        const aircraftReady = !! options.aircraftInventory;

        if ( mode === 'transfer' && ! transferReady ) {
            return;
        }
        if ( mode !== 'transfer' && ! aircraftReady ) {
            return;
        }

        // Spoken hangar prompts yield to the storage modal.
        if ( l.ui && l.ui.dialog && l.ui.dialog.isShowing() ) {
            l.ui.dialog.hide();
        }

        this.menuUI.hide();
        this.events.clearDrag();
        this.events.clearLongPress();

        this.mode = mode;
        this.locationInventory = options.locationInventory || null;
        this.aircraftInventory = options.aircraftInventory || null;
        this.selected = null;
        this.open = true;

        this.container.classList.toggle( 'transfer', mode === 'transfer' );
        this.locationWindow.hidden = mode !== 'transfer';
        this.aircraftWindow.hidden = false;
        this.container.hidden = false;
        this.contents.render();

        const closeButton = this.container.querySelector( '.item_screen_close' );
        if ( closeButton ) {
            closeButton.focus();
        }
    }

    hide() {
        if ( ! this.open ) {
            return;
        }

        this.menuUI.hide();
        this.events.clearDrag();
        this.events.clearLongPress();

        this.open = false;
        this.mode = 'aircraft';
        this.locationInventory = null;
        this.aircraftInventory = null;
        this.selected = null;
        this.container.classList.remove( 'transfer' );
        this.locationWindow.hidden = true;
        this.container.hidden = true;
    }

    /**
     * Terminal computer: both bags so the player can load the ship.
     */
    openLocationTransfer() {
        const terminal = this.intents.getTerminal();
        const person = this.intents.getPersonObject();
        const aircraft = this.intents.getAircraftObject();
        const bags = terminal && terminal.bagsFor
            ? terminal.bagsFor( person, aircraft )
            : null;

        if ( ! bags ) {
            return;
        }

        this.show( {
            mode: 'transfer',
            locationInventory: bags.location,
            aircraftInventory: bags.aircraft,
        } );
    }

    /**
     * Flight / person-mode button: aircraft cargo only.
     */
    openAircraftInventory() {
        const inventory = this.intents.getAircraftInventory();
        if ( ! inventory ) {
            return;
        }

        this.show( {
            mode: 'aircraft',
            aircraftInventory: inventory,
        } );
    }

}
