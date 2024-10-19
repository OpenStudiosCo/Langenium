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
import Scanners from '@/scenograph/overlays/scanners.js';

export default class Overlays {
    hud;

    scanners;

    constructor() {}

    load() {
        // Heads Up Display (HUD).
        l.scenograph.overlays.hud = new HeadsUpDisplay();
        l.current_scene.animation_queue.push(
            l.scenograph.overlays.hud.animate
        );

        // Scanners.
        l.scenograph.overlays.scanners = new Scanners();
        l.current_scene.animation_queue.push(
            l.scenograph.overlays.scanners.animate
        );
    }
}
