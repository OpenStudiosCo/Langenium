/**
 * Multi input game controls.
 * - Keyboard
 * - Orbit Controls (disabled)
 * - Touch
 */

/**
 * Vendor libs
 */
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import KeyboardControls from "@/scenograph/controls/keyboard.js";
import TouchControls from "@/scenograph/controls/touch.js";

export default class Controls {
    keyboard;

    orbit;

    touch;

    init() {
        this.keyboard = new KeyboardControls();

        this.touch = new TouchControls();

    }

    activate() {
        // Indicate that game controls are active.
        l.current_scene.settings.game_controls = true;

        if ( l.scenograph.controls.touch ) {
            l.scenograph.controls.touch.activate();
        }

        window.addEventListener(
            "keydown",
            l.scenograph.controls.keyboard.onKeyDown,
            false
        );
        window.addEventListener(
            "keyup",
            l.scenograph.controls.keyboard.onKeyUp,
            false
        );
        l.current_scene.animation_queue.push(
            l.scenograph.controls.animate
        );

    }

    deactivate() {
        // Indicate that game controls are inactive.
        l.current_scene.settings.game_controls = false;

        if ( l.scenograph.controls.touch ) {
            l.scenograph.controls.touch.deactivate();
        }

        window.removeEventListener(
            "keydown",
            l.scenograph.controls.keyboard.onKeyDown
        );
        window.removeEventListener(
            "keyup",
            l.scenograph.controls.keyboard.onKeyUp
        );

        // Remove this item from the scene controls from the main animation queue.
        l.current_scene.animation_queue.filter(
            animation_queue_update => animation_queue_update !== l.scenograph.controls.animate
        );

        // @todo Test and uncomment.
        // if (l.config.settings.debug) {
        //     stats = new Stats();
        //     stats.dom.remove();
        // }

    }

    animate() {
        if ( l.scenograph.controls.orbit )
            l.scenograph.controls.orbit.update();
    }

    debug_on() {
        this.orbit = new OrbitControls( l.current_scene.camera, l.current_scene.renderers.webgl.domElement );
        this.orbit.target.set( 0, 10.775, 0 );
    }

    debug_off() {
        this.orbit.dispose();
        this.orbit = false;

        // Reset camera y position after disengaging orbit controls.
        l.current_scene.camera.position.copy( l.current_scene.scene_objects.ship.mesh.position );
        l.current_scene.camera.position.y += 10.775 / 4;
    }
}