/**
 * Multi input game controls.
 * - Keyboard
 * - Orbit Controls (disabled)
 * - Touch
 */

import KeyboardControls from "./controls/keyboard.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import TouchControls from "./controls/touch.js";

export default class Controls {
    keyboard;

    orbit;

    touch;

    constructor() {
        this.keyboard = new KeyboardControls();

        this.orbit = new OrbitControls(window.l.current_scene.camera, window.l.current_scene.renderers.webgl.domElement);
        this.orbit.target.set(0,10.775,0);

        this.touch = new TouchControls();

    }

    activate() {
        // Indicate that game controls are active.
        window.l.current_scene.settings.game_controls = true;

        if ( window.l.controls.touch ) {
            window.l.controls.touch.activate();
        }

        // window.l.controls.orbit = new OrbitControls(window.l.current_scene.camera, window.l.current_scene.renderers.webgl.domElement);
        // window.l.controls.orbit.target.set(0,10.775,0);

        window.addEventListener(
            "keydown",
            window.l.controls.keyboard.onKeyDown,
            false
        );
        window.addEventListener(
            "keyup",
            window.l.controls.keyboard.onKeyUp,
            false
        );
        window.l.current_scene.animation_queue.push(
            window.l.controls.animate
        );

    }

    deactivate() {
        // Indicate that game controls are inactive.
        window.l.current_scene.settings.game_controls = false;

        if ( window.l.controls.touch ) {
            window.l.controls.touch.deactivate();
        }
        
        window.removeEventListener(
            "keydown",
            window.l.controls.keyboard.onKeyDown
        );
        window.removeEventListener(
            "keyup",
            window.l.controls.keyboard.onKeyUp
        );

        // Remove this item from the scene controls from the main animation queue.
        window.l.current_scene.animation_queue.filter(
            animation_queue_update => animation_queue_update !== window.l.controls.animate
        );

        // @todo Test and uncomment.
        // if (window.l.current_scene.debug) {
        //     stats = new Stats();
        //     stats.dom.remove();
        // }

    }

    animate() {
        if (window.l.controls.orbit)
            window.l.controls.orbit.update();
    }
}
