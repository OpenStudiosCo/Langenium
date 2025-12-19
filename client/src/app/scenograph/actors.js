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

    map;

    constructor() {
        this.map = new Map();
    }

    registerActor(actor) {
      if ( actor.class == 'player' ) {
          let player = new Player( actor );
          this.map.set(actor.name, player);
      }
    }

    get(name) {
      return this.map.get(name);
    }

    getAll() {
      return this.map.values();
    }

}
