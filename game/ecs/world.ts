/**
 * Game world simulation
 *
 * - Loads a scene definition
 * - Builds entities using components
 * - Advances simulation on a fixed timestep
 *
 */


// Import YAML configs.
import CargoShip from "./data/objects/cargoShip.yml";
import Person from "./data/objects/person.yml";
import Raven from "./data/objects/raven.yml";
import Valiant from "./data/objects/valiant.yml";
import Overworld from "./data/scenes/overworld.yml";

import { Name } from "./components/name";
import { Transform } from "./components/Transform";
import { Motion } from "./components/Motion";

import { movementSystem } from "./systems/movement";

export default class World {

    public configs: Record<string, any>;
    public instances: Record<string, any>;

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
            this.configs = Overworld.entities;
            this.instances = new Map<string, any>();

            this.lastUpdateTime = performance.now();
            this.fixedDelta = 16; // ~60 FPS for logic

            this.load();
            this.start();
        }
    }

    load() {
        // Load entities.
        for (const entityConfig of this.configs.values()) {
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
                    case 'Movable':
                        entityInstance.components.Motion = {
                            velocity: {
                                horizontal: 0,
                                vertical: 0
                            },
                            altitude: 0,
                            heading: 0
                        } as Motion;
                        break;
                    case 'Renderable':
                        // Load object specific settings from config.
                        if (componentData.object === 'cargoShip') {
                            entityInstance.maxSpeed = CargoShip.maxSpeed;
                        }
                        if (componentData.object === 'person') {
                            entityInstance.maxSpeed = Person.maxSpeed;
                        }
                        if (componentData.object === 'raven') {
                            entityInstance.maxSpeed = Raven.maxSpeed;
                        }
                        if (componentData.object === 'valiant') {
                            entityInstance.maxSpeed = Valiant.maxSpeed;
                        }
                        break;
                }
            }

            this.instances.set(entityConfig.id, entityInstance);
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
        movementSystem(this.instances, this.fixedDelta);
        // Later: call other systems here, e.g., AI, collision, rendering
    }


}
