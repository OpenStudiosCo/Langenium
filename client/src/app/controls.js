/**
 * Multi input game controls.
 * - Orbit Controls
 * - Keyboard
 * - Touch (@todo)
 */

import KeyboardControls from './controls/keyboard.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class Controls {

    keyboardControls;

    orbitControls;

    constructor() {
        this.keyboard = new KeyboardControls();

        this.orbitControls = new OrbitControls(window.test_scene.camera, window.test_scene.renderers.webgl.domElement);
        this.orbitControls.target.set(0, 12, 0);
        this.orbitControls.update();
    }

}
