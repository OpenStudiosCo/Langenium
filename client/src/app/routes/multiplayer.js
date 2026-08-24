/**
 * @name            Multi Player
 * @description     Managees the game client's multi player mode.
 * @namespace       l.routes.multiplayer
 * @memberof        l.routes
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class multiPlayerRoute {

    constructor() {
        console.log( 'Multi player launched' );

        // Start controls.
        l.scenograph.controls.activate();

        // Start overlays.
        l.scenograph.overlays.activate();

        let serverLocation = l.env == 'Dev' ? 'lcl.langenium.com:8090' : 'test.langenium.com:42069';

        l.scenograph.modes.multiplayer.connect( '//' + serverLocation );

        // Set client mode.
        l.mode = 'multi_player';

    }

}
