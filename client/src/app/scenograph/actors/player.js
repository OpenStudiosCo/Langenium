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

    constructor( actorInstance ) {

        this.actorInstance = actorInstance;

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
        this.vehicle = new l.scenograph.objects.vehicles.valiant();
        await this.vehicle.load();
        l.current_scene.scene.add(
          this.vehicle.mesh
        );
        l.current_scene.animation_queue.push(
            delta => this.vehicle.animate(delta)
        );

        // Setup person, used for the hangar scene.
        this.person = new l.scenograph.objects.vehicles.person(this.actorInstance);
        l.current_scene.scene.add(
            this.person.mesh
        );
        l.current_scene.animation_queue.push(
            delta => this.person.animate(delta)
        );

    }

}
