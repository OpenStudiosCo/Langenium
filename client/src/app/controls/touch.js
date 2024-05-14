/**
 * Touch Controls
 * 
 * Based on https://mese79.github.io/TouchControls/
 */

import TouchControlUI from './touch/TouchControlUI';

export default class TouchControls {
    controls;

    constructor() {
        // Controls
        let options = {
            delta: 0.75, // coefficient of movement
            moveSpeed: 0.005, // speed of movement
            rotationSpeed: 0.005, // coefficient of rotation
            maxPitch: 55, // max camera pitch angle
        }
        this.controls = new TouchControlUI(
            document.querySelector('body'),
            window.l.current_scene.camera,
            options
        );
        this.controls.movementPad.padElement.style.display = 'none';
        this.controls.rotationPad.padElement.style.display = 'none';
        this.controls.sliderStick.padElement.style.display = 'none';

    }

    activate() {
        this.controls.enabled = true;
        window.l.controls.touch.controls.movementPad.padElement.style.display = '';
        window.l.controls.touch.controls.rotationPad.padElement.style.display = '';
        window.l.controls.touch.controls.sliderStick.padElement.style.display = '';
    }

    deactivate() {
        this.controls.enabled = false;
        window.l.controls.touch.controls.movementPad.padElement.style.display = 'none';
        window.l.controls.touch.controls.rotationPad.padElement.style.display = 'none';
        window.l.controls.touch.controls.sliderStick.padElement.style.display = 'none';
    }
}
