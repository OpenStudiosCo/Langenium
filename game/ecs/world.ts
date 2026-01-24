/**
 * Game world simulation
 *
 * - Loads a scene definition
 * - Builds entities using components
 * - Advances simulation on a fixed timestep
 *
 */

import Overworld from "./scenes/overworld.yml";

import { Vec3 } from "./types";

import { Name } from "./components/name";
import { Transform } from "./components/Transform";



interface WorldConfig {
    entities: Record<string, any>;
}

interface WorldInstance {
    entities: Record<string, any>;
}

export default class World {

    public config: WorldConfig;
    public instance: WorldInstance;

    public fixedDelta: number;
    public lastUpdateTime: number;

    private accumulator = 0;
    private running = false;

    /**
     * Construct the game world instance.
     *
     * Parses config and builds a self updating virtual world simulation.
     *
     * @todo:
     * - load abstract scene definition file overworld.yml and parse it
     * - loop over config to load game world simulation in here and scenograph in the client
     */
    constructor( sceneName: string ) {
        if ( sceneName === 'Overworld' ) {
            this.config = {
                entities: Overworld.entities,
            }
            this.instance = {
                entities: new Map<string, any>(),
            };

            this.lastUpdateTime = performance.now();
            this.fixedDelta = 16; // ~60 FPS for logic

            this.load();
            this.start();
        }
    }

    load() {
        // Load entities.
        for (const entityConfig of this.config.entities.values()) {
            const entityInstance: any = { components: {}, config: entityConfig };

            // Attach each component
            for (const [componentName, componentData] of Object.entries(entityConfig.components)) {
                switch (componentName) {
                    case 'Name':
                        entityInstance.components.Name = componentData as Name;
                        break;
                    case 'Transform':
                        entityInstance.components.Transform = {
                            position: componentData.position,
                            rotation: componentData.rotation
                        } as Transform;
                        break;
                }
            }

            this.instance.entities.set(entityConfig.id, entityInstance);
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
        // for (const actorInstance of this.instance.actors.values()) {
        //     if (actorInstance.actor) {
        //         actorInstance.actor.update(this.fixedDelta);
        //     }
        //     if (actorInstance.object) {
        //         actorInstance.object.update(this.fixedDelta);
        //         if (actorInstance.actor.controls.forward || actorInstance.actor.controls.back) {
        //             this.checkHangarCollisions(actorInstance);
        //         }
        //     }
        // }
    }


}
