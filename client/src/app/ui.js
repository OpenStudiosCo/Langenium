/**
 * Controls UI elements on the page
 * 
 * Uses setInterval to update UI elements so they don't choke the animation loop.
 */

/**
 * Vendor libs
 */
import Alpine from 'alpinejs';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import Flight_Instruments from '@/ui/flight_instruments.js';
import Targeting from '@/ui/targeting.js';
import Menus from '@/ui/menus.js';
import ScoreTable from '@/ui/score_table.js';

export default class UI {

    // Custom class for controlling flight control UI
    flight_instruments;

    // Control the menu pane, needed by touch controls which activate later.
    menus;

    // Controls the score table.
    score_table;    

    // Controls the targeting list and locked UIs.
    targeting;

    // Array of callbacks and data for updating UI
    update_queue;

    // Function for performing UI updates
    updater;

    constructor() {
        // @todo: Determine if this needs to actually be here.
        window.Alpine = Alpine;
        Alpine.start();

        this.update_queue = [];

        this.score_table = new ScoreTable();

        this.update_queue.push( {
            callback: 'l.ui.score_table.update',
            data: []
        } );

        // /**
        //  * @todo: Move into a game mode activation function.
        //  */
        // this.targeting = new Targeting();

        // this.update_queue.push( {
        //     callback: 'l.ui.targeting.update',
        //     data: []
        // } );

    }

    /**
     * Activate Flight Instruments
     * 
     * Adds itself to the ui classes update queue.
     */
    show_flight_instruments() {
        l.ui.flight_instruments = new Flight_Instruments();
        document.querySelector( l.ui.flight_instruments.containerSelector + ' .control' ).classList.add( 'active' );

        l.ui.update_queue.push( {
            callback: 'l.ui.flight_instruments.update',
            data: []
        } );


    }

    /**
     * Deactivate Flight Instruments
     */
    hide_flight_instruments() {
        document.querySelector( l.ui.flight_instruments.containerSelector + ' .control' ).classList.remove( 'active' );
        l.ui.flight_instruments = false;

        // @todo: Remove specific updates instead of purging the whole queue.
        l.ui.update_queue = [];


    }

    /**
     * Activate the game menu overlays.
     * 
     * Called after game client boot up is complete.
     */
    show_menus() {
        l.ui.menus = new Menus();

        l.ui.updater = setInterval( this.update, 100 );
    }

    /**
     * Update
     * 
     * Runs on setInterval
     */
    update() {
        l.ui.update_queue.forEach( ( current_update, i ) => {
            _execute( current_update.callback, current_update.data, window );
        } );

    }

}
