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
    player;

    constructor() {
        this.map = new Map();
    }

    async registerActor(actor) {
        console.log(actor);
      if ( actor.class == 'player' ) {
          let player = new Player( actor );
          await player.load();
          this.map.set(actor.name, player);

          // @todo: Add player to the game world more dynamically.
          if ( actor.name == 'Player One' ) {
              this.player = player;
          }
      }
    }

    get(name) {
      return this.map.get(name);
    }

    getAll() {
      return this.map.values();
    }

}
