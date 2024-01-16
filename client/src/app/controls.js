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
        
    }

    activate() {
        // Indicate that game controls are active.
        window.l.current_scene.settings.game_controls = true;

        window.l.current_scene.controls.keyboard = new KeyboardControls();

        // this.orbit = new OrbitControls(window.l.current_scene.camera, window.l.current_scene.renderers.webgl.domElement);
        // this.orbit.target.set(0,10.775,0);
        // this.orbit.update();

        window.l.current_scene.controls.touch = new TouchControls();
        window.addEventListener(
            "keydown",
            window.l.current_scene.controls.keyboard.onKeyDown,
            false
        );
        window.addEventListener(
            "keyup",
            window.l.current_scene.controls.keyboard.onKeyUp,
            false
        );
        window.l.current_scene.animation_queue.push(
            window.l.current_scene.controls.animate
        );

        if (window.l.current_scene.debug) {
            stats = new Stats();
            document.body.appendChild(stats.dom);
        }
    }

    deactivate() {
        // Indicate that game controls are inactive.
        window.l.current_scene.settings.game_controls = false;
        
        window.removeEventListener(
            "keydown",
            window.l.current_scene.controls.keyboard.onKeyDown
        );
        window.removeEventListener(
            "keyup",
            window.l.current_scene.controls.keyboard.onKeyUp
        );

        // Remove this item from the scene controls from the main animation queue.
        window.l.current_scene.animation_queue.filter(
            animation_queue_update => animation_queue_update !== window.l.current_scene.controls.animate
        );

        // @todo Test and uncomment.
        // if (window.l.current_scene.debug) {
        //     stats = new Stats();
        //     stats.dom.remove();
        // }

        window.l.current_scene.controls.keyboard = false;
        window.l.current_scene.controls.touch = false;
    }

    animate() {
        if (window.l.current_scene.controls.orbit)
            window.l.current_scene.controls.orbit.update();
    }
}
