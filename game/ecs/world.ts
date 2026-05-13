/**
 * Game world simulation
 *
 * - Loads a scene definition
 * - Builds entities using components
 * - Advances simulation on a fixed timestep
 *
 */

import * as YUKA from 'yuka';

// Import YAML configs.
import CargoShip from "./data/objects/cargoShip.yml";
import Person from "./data/objects/person.yml";
import Raven from "./data/objects/raven.yml";
import Valiant from "./data/objects/valiant.yml";
import Overworld from "./data/scenes/overworld.yml";

// Base includes
import { Vec3 } from "./types";

// Components.
import { AI } from "./components/ai";
import { Motion } from "./components/motion";
import { Name } from "./components/name";
import { PlayerInput } from "./components/playerInput";
import { Scanner } from "./components/scanner";
import { Transform } from "./components/transform";
import { Weapon } from "./components/weapon";

// Systems.
import { aiSystem } from "./systems/ai";
import { movementSystem } from "./systems/movement";
import { scannerSystem } from './systems/scanner';

export default class World {

    private objectConfigMap: Record<string, any>;

    public configs: Record<string, any>;
    public entities: Record<string, any>;

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
        if (sceneName === 'Overworld') {
            this.objectConfigMap = {
                cargoShip: CargoShip,
                person: Person,
                raven: Raven,
                valiant: Valiant
            } as const;

            this.configs = Overworld.entities;
            this.entities = new Map<string, any>();

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
                    case 'PlayerInput':
                        let initialControlState = {
                            changing: false,
                            throttleUp: false,
                            throttleDown: false,
                            moveUp: false,
                            moveDown: false,
                            moveLeft: false,
                            moveRight: false,
                        };
                        entityInstance.components.PlayerInput = initialControlState as PlayerInput;
                        break;

                    case 'Name':
                        entityInstance.components.Name = componentData as Name;
                        break;
                    case 'Transform':
                        entityInstance.components.Transform = {
                            position: componentData.position ? componentData.position : {x: 0, y: 0, z: 0} as Vec3,
                            rotation: componentData.rotation ? componentData.rotation : {x: 0, y: 0, z: 0} as Vec3
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
                        if (entityConfig.components.Renderable && entityConfig.components.Renderable.object) {
                            // Load object specific settings from config.
                            if (entityConfig.components.Renderable.object === 'cargoShip') {
                                this.loadVehicle(entityInstance, CargoShip);
                            }
                            if (entityConfig.components.Renderable.object === 'person') {
                                entityInstance.components.Motion.limits = Person.limits;
                            }
                            if (entityConfig.components.Renderable.object === 'raven') {
                                this.loadVehicle(entityInstance, Raven, true);
                            }
                            if (entityConfig.components.Renderable.object === 'valiant') {
                                this.loadVehicle(entityInstance, Valiant, true);

                            }
                        }
                        break;
                }
            }

            this.entities.set(entityConfig.id, entityInstance);
        }

    }

    loadVehicle(entityInstance, vehicleConfig, hasWeapon = false) {
        entityInstance.components.AI = {
            entity: new YUKA.GameEntity(),
            tactics: entityInstance.config.components.AI
        } as AI;

        const vision = new YUKA.Vision( entityInstance.components.AI.entity );
        vision.range = 1500;
        vision.fieldOfView = Math.PI / 2; // 90 degrees
        entityInstance.components.AI.entity.vision = vision;

        entityInstance.components.Motion.limits = vehicleConfig.limits;

        entityInstance.components.Scanner = {
            range: vehicleConfig.scanner.range,
            fieldOfView: vehicleConfig.scanner.fov,
            targets: [],
            last: 0,
            timeout: 0,
        } as Scanner;

        if ( hasWeapon ) {
            entityInstance.components.Weapon = {
                scanner: entityInstance.components.Scanner,
                last: 0,
                timeout: 0,
            } as Weapon;
        }

    }

    getObjectConfig(objectName) {
        return this.objectConfigMap.get(objectName);
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
        aiSystem(this.entities, this.fixedDelta);
        movementSystem(this.entities, this.fixedDelta);
        scannerSystem(this.entities, this.fixedDelta);

        // @todo: move to AI system


        // Later: call other systems here, e.g., AI, collision, rendering
    }


}
