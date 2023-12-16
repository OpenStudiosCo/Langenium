/**
 * Multi input game controls.
 * - Keyboard
 * - Orbit Controls (disabled)
 * - Touch
 */

import KeyboardControls from './controls/keyboard.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TouchControls from './controls/touch.js';

export default class Controls {

    keyboard;

    orbit;

    touch;

    constructor() {
        this.keyboard = new KeyboardControls();

        // this.orbit = new OrbitControls(window.test_scene.camera, window.test_scene.renderers.webgl.domElement);
        // this.orbit.target.set(0,10.775,0);
        // this.orbit.update();

        this.touch = new TouchControls();
    }

    animate() {
        if (window.test_scene.controls.orbit)
            window.test_scene.controls.orbit.update();
    }

}
