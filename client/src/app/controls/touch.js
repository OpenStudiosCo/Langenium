/**
 * Touch Controls
 * 
 * Based on https://mese79.github.io/TouchControls/
 */

import TouchControls from './touch/TouchControls';

export default class Touch_Controls {
    controls;

    constructor() {
        // Controls
        let options = {
            delta: 0.75, // coefficient of movement
            moveSpeed: 0.005, // speed of movement
            rotationSpeed: 0.005, // coefficient of rotation
            maxPitch: 55, // max camera pitch angle
            hitTest: true, // stop on hitting objects
            hitTestDistance: 40 // distance to test for hit
        }
        this.controls = new TouchControls(
            document.querySelector('body'),
            window.l.current_scene.camera,
            options
        );
        this.controls.movementPad.padElement.style.display = 'none';
        this.controls.rotationPad.padElement.style.display = 'none';
        
        //this.controls.setPosition(0, 10.775, window.l.current_scene.scene_objects.ship.camera_distance)
        this.controls.addToScene(window.l.current_scene.scene)
    }

    activate() {
        this.controls.enabled = true;
        window.l.controls.touch.controls.movementPad.padElement.style.display = '';
        window.l.controls.touch.controls.rotationPad.padElement.style.display = '';
    }

    deactivate() {
        //window.l.current_scene.scene.remove(this.controls.fpsBody);
        this.controls.enabled = false;
        window.l.controls.touch.controls.movementPad.padElement.style.display = 'none';
        window.l.controls.touch.controls.rotationPad.padElement.style.display = 'none';
    }
}
