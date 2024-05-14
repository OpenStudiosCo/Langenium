/**
 * Controls flight instrument UI elements
 */

export default class Flight_Instruments {

    activated;

    containerSelector;

    updater;

    constructor() {

        this.activated = false;

        this.containerSelector = '#flight_instruments';

    }

    activate() {
        window.l.current_scene.ui.flight_instruments.activated = true;
    }

    // Updater, runs on setInterval
    update() {

        // Check if the main aircraft is loaded and ready
        if (window.l.current_scene.scene_objects.ship && window.l.current_scene.scene_objects.ship.ready) {

            if ( window.l.current_scene.settings.game_controls ) {
                if ( !window.l.current_scene.ui.flight_instruments.activated ) {
                    window.l.current_scene.ui.flight_instruments.activate();
                }
            }

            // Update the angle of the needle
            const angle = (Math.abs(window.l.current_scene.scene_objects.ship.state.airSpeed) * 1.94384) * 45;
            // Update the needle rotation
            document.querySelector(window.l.current_scene.ui.flight_instruments.containerSelector + ' #Airspeed #Needle').style.transform = `rotate(${angle}deg)`;
        }
        
    }

}
