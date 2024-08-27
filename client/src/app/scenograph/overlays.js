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
import Scanners from '@/scenograph/overlays/scanners.js';

export default class Overlays {
    scanners;

    constructor() {}

    addToScene( scene ) {
        // Scanners.
        l.scenograph.overlays.scanners = new Scanners();
        l.scenograph.overlays.scanners.addToScene( scene );
        l.current_scene.animation_queue.push(
            l.scenograph.overlays.scanners.animate
        );
    }
}
