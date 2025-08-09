/**
 * @name            Single Player
 * @description     Managees the game client's single player mode.
 * @namespace       l.routes.singleplayer
 * @memberof        l.routes
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class singlePlayerRoute {

    constructor() {
        console.log( 'Single player launched' );

        // Start controls.
        l.scenograph.controls.activate();

        // Start overlays.
        l.scenograph.overlays.activate();

        // Set client mode.
        l.mode = 'single_player';
    }

}
