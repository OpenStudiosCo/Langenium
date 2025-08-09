/**
 * @name            Routes
 * @description     Provides an interface to load and unload game modes and screens.
 * @namespace       l.routes
 * @memberof        l
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

import hangarRoute from '@/routes/hangar.js';
import multiPlayerRoute from '@/routes/multiplayer.js';
import singlePlayerRoute from '@/routes/singleplayer.js';

export default class routes {

    singlePlayer;

    constructor() {
        this.hangar = hangarRoute;
        this.multiPlayer = multiPlayerRoute;
        this.singlePlayer = singlePlayerRoute;
    }

}
