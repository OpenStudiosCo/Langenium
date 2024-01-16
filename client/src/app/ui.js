/**
 * Controls UI elements on the page
 * 
 * Uses setInterval to update UI elements so they don't choke the animation loop.
 */

import Alpine from 'alpinejs';

import Flight_Instruments from './ui/flight_instruments.js';
import Main_Menu from './ui/main_menu.js';
 
export default class UI {

    // Custom class for controlling flight control UI
    flight_instruments;

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
     * Activate Flight Controls
     * 
     * Adds itself to the ui classes update queue.
     */
    show_flight_instruments() {        
        window.l.current_scene.ui.flight_instruments = new Flight_Instruments();

        window.l.current_scene.ui.update_queue.push({
            callback: 'window.l.current_scene.ui.flight_instruments.update',
            data: []
        });

        window.l.current_scene.ui.updater = setInterval( this.update, 1 / 60);
    }

    /**
     * Activate Main Menu
     * 
     * Called during game client boot up
     */
    show_main_menu() {
        window.l.current_scene.ui.main_menu = new Main_Menu();
    }

    /**
     * Update
     * 
     * Runs on setInterval
     */
    update() {
        window.l.current_scene.ui.update_queue.forEach((current_update, i) => {
            _execute(current_update.callback, current_update.data, window);
        });
            
    }

}
