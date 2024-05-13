/**
 * Touch Controls
 * 
 * Based on https://mese79.github.io/TouchControls/
 */

import TouchControls from '../../vendor/TouchControls-master/js/TouchControls';

export default class Touch_Controls {
    controls;

    constructor() {
        
    }

    activate() {
        // Controls
        let options = {
            delta: 0.75, // coefficient of movement
            moveSpeed: 0.5, // speed of movement
            rotationSpeed: 0.005, // coefficient of rotation
            maxPitch: 55, // max camera pitch angle
            hitTest: true, // stop on hitting objects
            hitTestDistance: 40 // distance to test for hit
        }
        this.controls = new TouchControls(
            document.querySelector('body'),
            window.l.current_scene.camera,
            options
        )
        //this.controls.setPosition(0, 10.775, window.l.current_scene.scene_objects.ship.camera_distance)
        this.controls.addToScene(window.l.current_scene.scene)
    }

    deactivate() {
        window.l.current_scene.scene.remove(this.controls.fpsBody);
        this.controls = false;
    }
}
