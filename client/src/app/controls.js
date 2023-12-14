/**
 * Multi input game controls.
 * - Orbit Controls
 * - Keyboard
 * - Touch (@todo)
 */

import KeyboardControls from './controls/keyboard.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class Controls {

    keyboard;

    orbit;

    constructor() {
        this.keyboard = new KeyboardControls();
    }

    startOrbit() {
        this.orbit = new OrbitControls(window.test_scene.camera, window.test_scene.renderers.webgl.domElement);
        this.orbit.target.set(0,10.775,0);
        this.orbit.update();
    }

    animate() {
        if (window.test_scene.controls.orbit)
            window.test_scene.controls.orbit.update();
    }

}
