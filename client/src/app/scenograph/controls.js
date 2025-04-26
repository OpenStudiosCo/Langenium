/**
 * Multi input game controls.
 * - Keyboard
 * - Orbit Controls (disabled)
 * - Touch
 */

/**
 * Vendor libs
 */
import * as THREE from "three";
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
    orbitTarget;

    touch;

    init() {
        this.keyboard = new KeyboardControls();

        this.touch = new TouchControls();

        l.current_scene.animation_queue.push(
            l.scenograph.controls.animate
        );
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
        if ( l.scenograph.controls.orbit ) {
        
            l.scenograph.controls.orbit.target.set(
                l.scenograph.controls.orbitTarget.x,
                l.scenograph.controls.orbitTarget.y,
                l.scenograph.controls.orbitTarget.z
            );
            l.scenograph.controls.orbit.update();
        }
    }

    // Changes the orbit target based on object id.
    set_target( object_id ) {
        let target_object = l.current_scene.scene.getObjectById( object_id );

        if (target_object.name == 'Bot Ship') {
            target_object = l.current_scene.objects.bot.mesh.userData.actor.entity;
        }

        l.scenograph.controls.orbitTarget = target_object.position.clone();
        l.scenograph.cameras.orbit.position.copy( l.scenograph.controls.orbitTarget );
        l.scenograph.cameras.orbit.position.y = 500;
        l.scenograph.cameras.orbit.translateZ( - 500 );
        l.scenograph.cameras.orbit.updateProjectionMatrix();
        l.scenograph.controls.orbit.update();
    }

    debug_on() {
        this.orbit = new OrbitControls( l.scenograph.cameras.orbit, l.current_scene.renderers.webgl.domElement );
        this.orbitTarget = new THREE.Vector3( 0, 10.775, 0 );
        //this.orbit.target.set( this.orbitTarget );
    }

    debug_off() {
        this.orbit.dispose();
        this.orbit = false;

        // Reset camera y position after disengaging orbit controls.
        // l.scenograph.cameras.player.position.copy( l.current_scene.objects.player.mesh.position );
        // l.scenograph.cameras.player.position.y += 10.775 / 4;
    }
}
