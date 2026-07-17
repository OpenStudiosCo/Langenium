/**
 * @name            Player
 * @description     Provides an interface to the player actor in the game.
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

    constructor( actorEntity ) {

        this.actorEntity = actorEntity;

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

    async load() {

        // Setup aircraft, used for the intro sequence.
        this.vehicle = await l.scenograph.objects.vehicles.valiant.get(this.actorEntity);
        l.current_scene.scene.add(
          this.vehicle
        );

        // Setup person, used for the hangar scene.
        this.person = await l.scenograph.objects.vehicles.person.get(this.actorEntity);
        l.current_scene.scene.add(
            this.person
        );

    }

}
