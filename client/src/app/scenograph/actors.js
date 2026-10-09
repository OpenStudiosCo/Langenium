/**
 * @name            Actors
 * @description     Provides an interface to manage actors.
 * @namespace       l.scenograph.actors
 * @memberof        l.scenograph
 * @global
 *
 * @todo: #31 consider removal now that world instance manages and updates actors.
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import DemoShip from '@/scenograph/actors/demoShip.js';
import Player from '@/scenograph/actors/player.js';

export default class Actors {

    map;
    player;

    constructor() {
        this.map = new Map();
        this.map.set('Demo Ship', new DemoShip());
    }

    async registerActor(actorInstance) {
        if ( actorInstance.config.class == 'player' ) {
            let player = new Player( actorInstance );
            await player.load();
            this.map.set(actorInstance.config.name, player);
        }
    }

    get(name) {
      return this.map.get(name);
    }

    getAll() {
      return this.map.values();
    }

}
