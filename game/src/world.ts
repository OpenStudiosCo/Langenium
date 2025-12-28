/**
 * Game World class
 *
 * Loads and runs simulations of game scenes
 *
 */
// @todo: allow dynamic loading of other scenes.
import Overworld from "./scenes/overworld.yml";

import ActorPlayer from './actors/player2';

import ObjectHangar from './objects/structures/hangar';
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
        // Load actors and their attached objects.
        for (const actorConfig of this.config.actors.values()) {
            const actorInstance: any = { config: actorConfig };
            // Set actor class first.
            actorInstance.actor = this.loadActor(actorConfig.class);

            // Set object class.
            actorInstance.object = this.loadObject(actorConfig);

            // Set objects actor properties to actor.
            if ( actorInstance.actor && actorInstance.object ) {
                actorInstance.object.actor = actorInstance.actor;
            }

            this.instance.actors.set(actorConfig.name, actorInstance);
        }

        // Load static objects into the world.
        for (const objectConfig of this.config.objects.values()) {
            const objectInstance: any = { config: objectConfig };

            // Set object class.
            objectInstance.object = this.loadObject(objectConfig);

            if (objectConfig.hangars){
                objectInstance.hangars = [];
                objectConfig.hangars.forEach(hangarConfig => {
                    const hangarInstance: any = { config: hangarConfig };
                    hangarInstance.object = this.loadObject({
                        ...hangarConfig,
                        model: 'hangar'
                    });
                    objectInstance.hangars.push(hangarInstance);
                });
            }

            this.instance.objects.set(objectConfig.name, objectInstance);
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

    loadObject(config: any) {
        if (config.model == 'person') {
            return new ObjectPerson();
        }
        else if (config.model == 'hangar') {
            return new ObjectHangar(config);
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
                this.checkCollisions(actor.object);
            }
        }
    }

    checkCollisions(object: ObjectPerson) {
        // Get object's proposed AABB at next position
        const objAABB = object.getAABBNext(); // you’ll need a method that returns AABB at nextPosition

        for (const other of this.instance.objects.values()) {

            if (!other.object || other.object === object) continue;

            const otherAABB = other.object.getAABB();

            // AABB collision check
            const overlapX = objAABB.min.x <= otherAABB.max.x && objAABB.max.x >= otherAABB.min.x;
            const overlapY = objAABB.min.y <= otherAABB.max.y && objAABB.max.y >= otherAABB.min.y;
            const overlapZ = objAABB.min.z <= otherAABB.max.z && objAABB.max.z >= otherAABB.min.z;

            if (overlapX && overlapY && overlapZ) {
                console.log('Collision detected!');
                return true; // stop at first collision or handle multiple collisions
            }
            console.log(overlapX, overlapY, overlapZ);
            debugger;
        }


        // No collision: commit next position
        object.commitNextPosition();
        return false;
    }

}
