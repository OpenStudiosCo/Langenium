/**
 * Controls UI elements on the page
 * 
 * Uses setInterval to update UI elements so they don't choke the animation loop.
 */
import Alpine from 'alpinejs';
 
export default class UI {

    update_queue;
    
    updater;

    constructor() {
        window.Alpine = Alpine;
 
        Alpine.start();

        this.update_queue = [];

        this.updater = setInterval( this.update, 1 / 60);
    }

    // Updater, runs on setInterval
    update() {
        // @kudos https://stackoverflow.com/a/28122081
        var i = window.test_scene.ui.update_queue.length
        while (i--) {
            
            window.test_scene.ui.update_queue.splice(i, 1);

            let current_update = window.test_scene.ui.update_queue[i];
            current_update.callback ( current_update.data ) ;
            
        }
        
    }

}
