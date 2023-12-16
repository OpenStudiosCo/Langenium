/**
 * Controls UI elements on the page
 * 
 * Uses setInterval to update UI elements so they don't choke the animation loop.
 */

import Alpine from 'alpinejs';

import Flight_Controls from './ui/flight_controls.js';
 
export default class UI {

    // Custom class for controlling flight control UI
    flight_controls;

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
     * Activate
     * 
     * Called after construction to attach controls when the update_queue is ready.
     */
    activate() {
        this.flight_controls = new Flight_Controls();

        window.test_scene.ui.update_queue.push({
            callback: 'window.test_scene.ui.flight_controls.update',
            data: []
        });

        this.updater = setInterval( this.update, 1 / 60);
    }

    /**
     * Update
     * 
     * Runs on setInterval
     */
    update() {
        window.test_scene.ui.update_queue.forEach((current_update, i) => {
            _execute(current_update.callback, current_update.data, window);
        });
            
    }

}
