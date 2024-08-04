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
        l.ui.flight_instruments.activated = true;
    }

    // Updater, runs on setInterval
    update() {

        // Check if the main aircraft is loaded and ready
        if (l.current_scene.scene_objects.player && l.current_scene.scene_objects.player.ready) {

            if ( l.current_scene.settings.game_controls ) {
                if ( !l.ui.flight_instruments.activated ) {
                    l.ui.flight_instruments.activate();
                }
            }

            // Update the angle of the needle
            const angle = (Math.abs(l.current_scene.scene_objects.player.state.airSpeed) * 1.94384) * 45;
            // Update the needle rotation
            document.querySelector(l.ui.flight_instruments.containerSelector + ' #Airspeed #Needle').style.transform = `rotate(${angle}deg)`;
        }
        
    }

}
