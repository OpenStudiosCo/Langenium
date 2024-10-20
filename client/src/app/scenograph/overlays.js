/**
 * @name            Overlays
 * @description     Provides 2D overlays to the 3D environment.
 * @namespace       l.scenograph.overlays
 * @memberof        l.scenograph
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import HeadsUpDisplay from '@/scenograph/overlays/heads-up-display.js';
import Map from '@/scenograph/overlays/map.js';
import Scanners from '@/scenograph/overlays/scanners.js';

export default class Overlays {
    hud;

    scanners;

    constructor() {}

    activate() {
        // Heads Up Display (HUD).
        l.scenograph.overlays.hud = new HeadsUpDisplay();
        l.current_scene.animation_queue.push(
            l.scenograph.overlays.hud.animate
        );

        // Mini Map.
        l.scenograph.overlays.map = new Map();
        l.current_scene.animation_queue.push(
            l.scenograph.overlays.map.animate
        );

        // Scanners.
        l.scenograph.overlays.scanners = new Scanners();
        l.current_scene.animation_queue.push(
            l.scenograph.overlays.scanners.animate
        );
    }

    deactivate() {
        // Heads Up Display (HUD).
        l.scenograph.overlays.hud.container.innerHTML = '';
        l.current_scene.animation_queue.filter(
            animation_queue_update => animation_queue_update !== l.scenograph.overlays.hud.animate
        );
        //l.scenograph.overlays.hud = false;

        // Mini Map.
        l.scenograph.overlays.map.container.innerHTML = '';
        l.current_scene.animation_queue.filter(
            animation_queue_update => animation_queue_update !== l.scenograph.overlays.map.animate
        );
        l.scenograph.overlays.map.container.style.display = 'none';
        //l.scenograph.overlays.map = false;

        // Scanners.
        l.scenograph.overlays.scanners.container.innerHTML = '';
        l.current_scene.animation_queue.filter(
            animation_queue_update => animation_queue_update !== l.scenograph.overlays.scanners.animate
        );
        //l.scenograph.overlays.scanners = false;
    }
}
