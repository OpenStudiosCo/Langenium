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

interface WorldConfig {
    actors: Record<string, any>;
    objects: Record<string, any>;
}

interface WorldInstance {
    actors: Record<string, any>;
    objects: Record<string, any>;
}

export default class World {

    public config: WorldConfig;
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
        this.config = {
            actors: config.actors,
            objects: config.objects
        }
        this.instance = {
            actors: new Map<string, any>(),
            objects: new Map<string, any>()
        };

        this.lastUpdateTime = performance.now();
        this.fixedDelta = 16; // ~60 FPS for logic


        this.load();
        this.start();

    }

    load() {
        for (const actorConfig of this.config.actors.values()) {
            const actorInstance: any = { config: actorConfig };
            // Set actors first.
            actorInstance.actor = this.loadActor(actorConfig.class);

            // Set objects.
            actorInstance.object = this.loadObject(actorConfig.model);

            // Set objects actor properties to actor.
            if ( actorInstance.actor && actorInstance.object ) {
                actorInstance.object.actor = actorInstance.actor;
            }

            this.instance.actors.set(actorConfig.name, actorInstance);
        }
    }

    loadActor(actorClass: string) {
        if (actorClass == 'player') {
            return new ActorPlayer();
        }
        else {
            return false;
        }
    }

    loadObject(actorModel: string) {
        if (actorModel == 'person') {
            return new ObjectPerson();
        }
        else {
            return false;
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
            if (actor.actor) {
                actor.actor.update(this.fixedDelta);
            }
            if (actor.object) {
                actor.object.update(this.fixedDelta);
            }
        }
    }

}
