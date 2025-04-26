/**
 * Controls flight instrument UI elements
 * 
 * @todo: v7: Remove if not used.
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

    /**
     * Update hook.
     * 
     * This method is called within the UI setInterval updater, allowing
     * HTML content to be updated at different rate than the 3D frame rate.
     * 
     * @method update
     * @memberof Flight_Instruments
     * @global
     * @note All references within this method should be globally accessible.
    **/
    update() {

        // Check if the main aircraft is loaded and ready
        if (l.current_scene.objects.player && l.current_scene.objects.player.ready) {

            if ( l.current_scene.settings.game_controls ) {
                if ( !l.ui.flight_instruments.activated ) {
                    l.ui.flight_instruments.activate();
                }
            }

            // Update the angle of the needle
            const angle = (Math.abs(l.current_scene.objects.player.airSpeed) * 1.94384) * 45;
            // Update the needle rotation
            document.querySelector(l.ui.flight_instruments.containerSelector + ' #Airspeed #Needle').style.transform = `rotate(${angle}deg)`;
        }
        
    }

}
