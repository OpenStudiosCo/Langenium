/**
 * Controls UI elements on the page
 * 
 * Uses setInterval to update UI elements so they don't choke the animation loop.
 */

import Alpine from 'alpinejs';

import Flight_Instruments from './ui/flight_instruments.js';
import Menus from './ui/menus.js';

export default class UI {

    // Custom class for controlling flight control UI
    flight_instruments;

    // Control the menu pane, needed by touch controls which activate later.
    menus;

    // Array of callbacks and data for updating UI
    update_queue;

    // Function for performing UI updates
    updater;

    constructor() {
        // @todo: Determine if this needs to actually be here.
        window.Alpine = Alpine;
        Alpine.start();

        this.update_queue = [];

    }

    /**
     * Activate Flight Instruments
     * 
     * Adds itself to the ui classes update queue.
     */
    show_flight_instruments() {
        window.l.current_scene.ui.flight_instruments = new Flight_Instruments();
        document.querySelector( window.l.current_scene.ui.flight_instruments.containerSelector + ' .control' ).classList.add( 'active' );

        window.l.current_scene.ui.update_queue.push( {
            callback: 'window.l.current_scene.ui.flight_instruments.update',
            data: []
        } );


    }

    /**
     * Deactivate Flight Instruments
     */
    hide_flight_instruments() {
        document.querySelector( window.l.current_scene.ui.flight_instruments.containerSelector + ' .control' ).classList.remove( 'active' );
        window.l.current_scene.ui.flight_instruments = false;

        // @todo: Remove specific updates instead of purging the whole queue.
        window.l.current_scene.ui.update_queue = [];


    }

    /**
     * Activate the game menu overlays.
     * 
     * Called after game client boot up is complete.
     */
    show_menus() {
        window.l.current_scene.ui.menus = new Menus();

        window.l.current_scene.ui.updater = setInterval( this.update, 1 / 60 );
    }

    /**
     * Update
     * 
     * Runs on setInterval
     */
    update() {
        window.l.current_scene.ui.update_queue.forEach( ( current_update, i ) => {
            _execute( current_update.callback, current_update.data, window );
        } );

    }

}
