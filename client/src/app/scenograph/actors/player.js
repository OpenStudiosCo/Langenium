/**
 * @name            Player
 * @description     Provides an interface to the player actor in the game.
 * @namespace       l.scenograph.actors.player
 * @memberof        l.scenograph.actors
 * @global
 */

/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class Player {

    // Whether the player is in their vehicle or not.
    mode;

    ready;

    // Character model.
    person;

    // Vehicle model.
    vehicle;

    constructor() {

        this.ready = false;

        this.person = false;

        this.vehicle = false;

        this.setMode();
    }

    setMode( mode = 'vehicle' ) {
        if ( mode === 'vehicle' ) {
            this.mode = 'vehicle';
        }
        else {
            this.mode = 'person';
        }
    }

}
