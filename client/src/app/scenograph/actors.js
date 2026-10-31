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
import DemoTour from '@/scenograph/actors/demoTour.js';
import Player from '@/scenograph/actors/player.js';

export default class Actors {

    map;
    player;

    constructor() {
        this.map = new Map();
        this.map.set('Demo Tour', new DemoTour());
    }

    async registerActor(actorInstance) {
        if ( actorInstance.config.class == 'player' ) {
            return this.ensurePlayer( actorInstance );
        }
    }

    /**
     * Bind the World player into the scenograph once; later sessions reuse the same client Player.
     */
    async ensurePlayer( actorInstance ) {
        const name = ( actorInstance.config && actorInstance.config.name ) || 'Player';
        let player = this.map.get( name );

        if ( player ) {
            player.actorInstance = actorInstance;
            if ( player.person ) {
                player.person.game = actorInstance;
            }
            this.player = player;
            return player;
        }

        player = new Player( actorInstance );
        await player.load();
        this.map.set( name, player );
        this.player = player;
        return player;
    }

    get(name) {
      return this.map.get(name);
    }

    getAll() {
      return this.map.values();
    }

}
