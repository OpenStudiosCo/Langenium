/**
 * Game World class
 *
 * Loads and runs simulations of game scenes
 *
 */
// @todo: allow dynamic loading of other scenes.
import Overworld from "./scenes/overworld.yml";

import ActorPlayer from './actors/player2';
import ObjectPerson from './objects/person2';

interface WorldInstance {
    actors: Record<string, any>;
    objects: Record<string, any>;
}

export default class World {

    public instance: WorldInstance;

    constructor( sceneName: string ) {
        if ( sceneName === 'Overworld' ) {
            this.initialise( Overworld );
        }
    }

    /**
     * Initialise game world instance.
     *
     * Parses config and builds a self updating virtual world simulation.
     *
     * @todo:
     * - load abstract scene definition file overworld.yml and parse it
     * - loop over config to load game world simulation in here and scenograph in the client
     */
    initialise( config ) {
        this.instance = {
            actors: config.actors,
            objects: config.objects
        };

        this.lastUpdateTime = performance.now();
        this.fixedDelta = 16; // ~60 FPS for logic


        this.load();
        this.start();
    }

    load() {
        for (const actor of this.instance.actors.values()) {
            if (actor.name =='Player Two') {
                // Set actors first.
                if (actor.class == 'player') {
                    actor.actor = new ActorPlayer();
                }

                // Set objects.
                if (actor.model == 'person') {
                    actor.object = new ObjectPerson();
                }

                // Set objects actor properties to actor.
                if ( actor.actor && actor.object ) {
                    actor.object.actor = actor.actor;
                }
            }
        }
    }

    start() {
        this.updateLoop = setInterval(() => this.update(), this.fixedDelta);
    }

    stop() {
        clearInterval(this.updateLoop);
    }

    update() {
        for (const actor of this.instance.actors.values()) {
            if (actor.name =='Player Two') {
                actor.actor.update(this.fixedDelta);
                actor.object.update(this.fixedDelta);
            }
            console.log(this, actor);
            //actor.updateState(this.fixedDelta);
        }
        debugger;
    }

}
