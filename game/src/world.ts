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
import ObjectPerson from './objects/person';

interface WorldConfig {
    actors: Record<string, any>;
    objects: Record<string, any>;
}

interface WorldInstance {
    actors: Record<string, any>;
    objects: Record<string, any>;
}

const PLAYER_NAME = 'Player';

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
        // Load scene NPCs. The human player is spawned on Play from defaults / a save.
        for (const actorConfig of this.config.actors.values()) {
            if ( actorConfig.class === 'player' ) {
                continue;
            }

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

    /**
     * Insert the human player from defaults or a save overlay.
     * Replaces any previous player actor in this world instance.
     */
    spawnPlayer( playerConfig: any ) {
        this.despawnPlayer();

        const config = {
            ...playerConfig,
            name: playerConfig.name || PLAYER_NAME,
            class: 'player',
            model: 'person',
        };

        const actorInstance: any = { config };
        actorInstance.actor = this.loadActor( 'player' );
        actorInstance.object = this.loadObject( config );

        if ( actorInstance.actor && actorInstance.object ) {
            actorInstance.object.actor = actorInstance.actor;
        }

        if ( actorInstance.object && config.position ) {
            actorInstance.object.position.x = config.position.x;
            actorInstance.object.position.y = config.position.y;
            actorInstance.object.position.z = config.position.z;
        }
        if ( actorInstance.object && config.rotation ) {
            actorInstance.object.rotation.x = config.rotation.x;
            actorInstance.object.rotation.y = config.rotation.y;
            actorInstance.object.rotation.z = config.rotation.z;
        }

        this.instance.actors.set( config.name, actorInstance );
        return actorInstance;
    }

    despawnPlayer() {
        if ( ! this.instance || ! this.instance.actors ) {
            return;
        }

        for ( const [ name, actorInstance ] of this.instance.actors.entries() ) {
            if ( actorInstance && actorInstance.config && actorInstance.config.class === 'player' ) {
                this.instance.actors.delete( name );
            }
        }
    }

    getPlayer() {
        if ( ! this.instance || ! this.instance.actors ) {
            return null;
        }
        return this.instance.actors.get( PLAYER_NAME ) || null;
    }

    /**
     * Hangar config for a player's assignment (structure + hangarName).
     * Layout / pose data for the assigned bay — not inventory ownership.
     */
    getHangarConfig( hangarRef: { structure?: string; hangarName?: string } | null ) {
        if ( ! hangarRef || ! hangarRef.structure || ! hangarRef.hangarName ) {
            return null;
        }
        if ( ! this.instance || ! this.instance.objects ) {
            return null;
        }

        const structure = this.instance.objects.get( hangarRef.structure );
        if ( ! structure || ! structure.hangars ) {
            return null;
        }

        const hangarInstance = structure.hangars.find(
            ( entry: any ) => entry.config && entry.config.name === hangarRef.hangarName
        );
        return hangarInstance && hangarInstance.config ? hangarInstance.config : null;
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

        // Ensure the user is still inside the hangar area and clear of obstacles.
        let inside = false;
        let blocked = false;
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

                                const obstacles = hangarInstance.object.obstacles || [];
                                for (const obstacleAABB of obstacles) {
                                    // Walking is horizontal; XZ overlap is enough to block.
                                    if (this.aabbOverlapsXZ(actorAABB, obstacleAABB)) {
                                        blocked = true;
                                        break;
                                    }
                                }

                            }
                        });
                    }

                }
            });

        }
        if (inside && ! blocked) {
            actorInstance.object.commitNextPosition();
        }

    }

    // Checks if actor Bounding Box is within the component Bounding Box.
    // Small slack only: the player spawns on the bay Z edge (halfSize sticks
    // out past the authored AABB), so zero offset freezes movement. Keep this
    // well under the old 1.25 so the hangar camera near plane (0.2) does not
    // slice wall meshes.
    aabbContained(actorBounds, componentBounds) {
        const offset = 0.4;
        return (
            actorBounds.min.x >= componentBounds.min.x - offset &&
            actorBounds.max.x <= componentBounds.max.x + offset &&
            actorBounds.min.y >= componentBounds.min.y - offset &&
            actorBounds.max.y <= componentBounds.max.y + offset &&
            actorBounds.min.z >= componentBounds.min.z - offset &&
            actorBounds.max.z <= componentBounds.max.z + offset
        );
    }

    // Horizontal overlap for solid hangar obstacles (ignore Y so pedestal
    // origins that sit below eye height still block walking).
    aabbOverlapsXZ(a, b) {
        return (
            a.min.x <= b.max.x &&
            a.max.x >= b.min.x &&
            a.min.z <= b.max.z &&
            a.max.z >= b.min.z
        );
    }

}
