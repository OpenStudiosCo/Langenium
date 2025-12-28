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

    private accumulator = 0;
    private running = false;

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
                    // Merge hangar position with world position;
                    hangarConfig.position = {
                        x: hangarConfig.position.x + objectConfig.position.x,
                        y: hangarConfig.position.y, // skip this one as the y offset is model specific.
                        z: hangarConfig.position.z + objectConfig.position.z
                    };
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
        this.running = true;
        this.lastUpdateTime = performance.now();

        const loop = () => {
            if (!this.running) return;

            const now = performance.now();
            const frameTime = now - this.lastUpdateTime;
            this.lastUpdateTime = now;

            // Prevent spiral of death
            this.accumulator += Math.min(frameTime, 250);

            while (this.accumulator >= this.fixedDelta) {
                this.update();
                this.accumulator -= this.fixedDelta;
            }

            setTimeout(loop, 0);
        };

        loop();
    }

    stop() {
        this.running = false;
    }

    update() {
        for (const actorInstance of this.instance.actors.values()) {
            if (actorInstance.actor) {
                actorInstance.actor.update(this.fixedDelta);
            }
            if (actorInstance.object) {
                actorInstance.object.update(this.fixedDelta);
                if (actorInstance.actor.controls.forward || actorInstance.actor.controls.back) {
                    this.checkHangarCollisions(actorInstance);
                }
            }
        }
    }

    checkHangarCollisions(actorInstance: any) {
        // Get object's proposed AABB at next position
        const actorAABB = actorInstance.object.getAABBNext();

        // Ensure the user is still inside the hangar area.
        let inside = false;
        if (actorInstance.config.hangar) {
            this.instance.objects.forEach((objectInstance, objectName) => {
                if (objectName == actorInstance.config.hangar.structure) {
                    if (objectInstance.hangars) {
                        objectInstance.hangars.forEach((hangarInstance) => {
                            if (hangarInstance.config.name == actorInstance.config.hangar.hangarName) {

                                for (const componentAABB of hangarInstance.object.aabb ) {
                                    if (this.aabbContained(actorAABB, componentAABB)) {
                                        inside = true;
                                        break;
                                    }
                                }

                            }
                        });
                    }

                }
            });

        }
        if (inside) {
            actorInstance.object.commitNextPosition();
        }

    }

    // Checks if actor Bounding Box is within the component Bounding Box
    aabbContained(actorBounds, componentBounds) {
        let offset = 1.25;
        return (
            actorBounds.min.x >= componentBounds.min.x - offset &&
            actorBounds.max.x <= componentBounds.max.x + offset &&
            actorBounds.min.y >= componentBounds.min.y - offset &&
            actorBounds.max.y <= componentBounds.max.y + offset &&
            actorBounds.min.z >= componentBounds.min.z - offset &&
            actorBounds.max.z <= componentBounds.max.z + offset
        );
    }

}
