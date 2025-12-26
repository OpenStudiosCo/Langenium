/**
 * Player Agent
 *
 * Defines a player entity in the game world.
 */

import * as YUKA from 'yuka';

import ActorBase from './base2';

export default class ActorPlayer extends ActorBase {

    constructor( ) {
        super( );

        this.entity = new YUKA.GameEntity();

    }

    /**
     * Update hook.
     *
     * This method is called within the main game world update loop.
     *
     * @method update
     * @memberof BaseActor
     * @global
    **/
    update(delta) {
        this.entity.update(delta);
    }
}
