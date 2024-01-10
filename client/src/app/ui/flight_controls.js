/**
 * Controls flight control UI elements
 */

export default class Flight_Controls {

    activated;

    containerSelector;

    updater;

    constructor() {

        this.activated = false;

        this.containerSelector = '#flight_controls';

    }

    activate() {
        window.l.current_scene.ui.flight_controls.activated = true;
        document.querySelector(window.l.current_scene.ui.flight_controls.containerSelector + ' .control').classList.add('active');
        
        // @todo fix touch control issues
        //window.l.current_scene.controls.touch.activate();
        // let fpsBody = window.l.current_scene.controls.touch.controls.fpsBody;
        // window.l.current_scene.controls.touch.controls.fpsBody = window.l.current_scene.scene_objects.ship.mesh;
        // window.l.current_scene.scene_objects.ship.mesh.add(fpsBody);
    }

    // Updater, runs on setInterval
    update() {

        if (window.l.current_scene.controls.touch &&window.l.current_scene.controls.touch.controls) {
            window.l.current_scene.controls.touch.controls.update();
        }

        // Check if the main aircraft is loaded and ready
        if (window.l.current_scene.scene_objects.ship && window.l.current_scene.scene_objects.ship.ready) {

            if ( !window.l.current_scene.ui.flight_controls.activated ) {
                window.l.current_scene.ui.flight_controls.activate();            
            }

            // Update the angle of the needle
            const angle = (Math.abs(window.l.current_scene.scene_objects.ship.state.airSpeed) * 1.94384) * 45;
            // Update the needle rotation
            document.querySelector(window.l.current_scene.ui.flight_controls.containerSelector + ' #Airspeed #Needle').style.transform = `rotate(${angle}deg)`;
        }
        
    }

}
