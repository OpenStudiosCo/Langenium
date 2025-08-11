/**
 * @name            Actors
 * @description     Provides an interface to manage actors.
 * @namespace       l.scenograph.actors
 * @memberof        l.scenograph
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import Player from '@/scenograph/actors/player.js';

export default class Actors {

    player;

    constructor() {
        this.player = new Player();
    }

}
