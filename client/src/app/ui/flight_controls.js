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
        window.test_scene.ui.flight_controls.activated = true;
        document.querySelector(window.test_scene.ui.flight_controls.containerSelector + ' .control').classList.add('active');
        
        // @todo fix touch control issues
        //window.test_scene.controls.touch.activate();
        // let fpsBody = window.test_scene.controls.touch.controls.fpsBody;
        // window.test_scene.controls.touch.controls.fpsBody = window.test_scene.scene_objects.ship.mesh;
        // window.test_scene.scene_objects.ship.mesh.add(fpsBody);
    }

    // Updater, runs on setInterval
    update() {

        if (window.test_scene.controls.touch &&window.test_scene.controls.touch.controls) {
            window.test_scene.controls.touch.controls.update();
        }

        // Check if the main aircraft is loaded and ready
        if (window.test_scene.scene_objects.ship && window.test_scene.scene_objects.ship.ready) {

            if ( !window.test_scene.ui.flight_controls.activated ) {
                window.test_scene.ui.flight_controls.activate();            
            }

            // Update the angle of the needle
            const angle = (Math.abs(window.test_scene.scene_objects.ship.state.airSpeed) * 1.94384) * 45;
            // Update the needle rotation
            document.querySelector(window.test_scene.ui.flight_controls.containerSelector + ' #Airspeed #Needle').style.transform = `rotate(${angle}deg)`;
        }
        
    }

}
