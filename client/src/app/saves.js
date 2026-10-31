/**
 * @name            Saves
 * @description     Three localStorage save slots for the single-player session.
 * @namespace       l.saves
 * @memberof        l
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import PlayerDefaults from '#/game/src/scenes/playerDefaults';
import { starterAircraftInventory } from '#/game/src/items/langeniumCrystal';

const SLOT_COUNT = 3;
const META_KEY = 'langenium.saves';
const slotKey = ( slot ) => 'langenium.save.' + slot;
const AUTOSAVE_MS = 60000;

export default class Saves {

    activeSlot;
    autosaveTimer;
    statusListeners;

    constructor() {
        this.activeSlot = null;
        this.autosaveTimer = null;
        this.statusListeners = [];
    }

    onStatus( listener ) {
        this.statusListeners.push( listener );
    }

    emitStatus( status, detail ) {
        for ( const listener of this.statusListeners ) {
            listener( status, detail );
        }
    }

    list() {
        const slots = [];
        for ( let i = 0; i < SLOT_COUNT; i++ ) {
            slots.push( {
                slot: i,
                payload: this.read( i ),
            } );
        }
        return slots;
    }

    read( slot ) {
        try {
            const raw = localStorage.getItem( slotKey( slot ) );
            if ( ! raw ) {
                return null;
            }
            const payload = JSON.parse( raw );
            return payload && typeof payload === 'object' ? payload : null;
        }
        catch ( error ) {
            return null;
        }
    }

    write( slot, payload ) {
        try {
            const body = {
                ...payload,
                slot,
                updatedAt: new Date().toISOString(),
            };
            localStorage.setItem( slotKey( slot ), JSON.stringify( body ) );
            this.writeMeta( slot );
            return true;
        }
        catch ( error ) {
            this.emitStatus( 'error', { slot, error } );
            return false;
        }
    }

    clear( slot ) {
        try {
            localStorage.removeItem( slotKey( slot ) );
            return true;
        }
        catch ( error ) {
            this.emitStatus( 'error', { slot, error } );
            return false;
        }
    }

    writeMeta( lastSlot ) {
        try {
            localStorage.setItem( META_KEY, JSON.stringify( {
                lastSlot,
                updatedAt: new Date().toISOString(),
            } ) );
        }
        catch ( error ) {
            // Meta is optional; ignore.
        }
    }

    cloneDefaults() {
        return JSON.parse( JSON.stringify( PlayerDefaults ) );
    }

    getPersonObject() {
        const player = l.scenograph && l.scenograph.actors && l.scenograph.actors.player;
        return player && player.actorInstance && player.actorInstance.object
            ? player.actorInstance.object
            : null;
    }

    getAircraftObject() {
        const player = l.scenograph && l.scenograph.actors && l.scenograph.actors.player;
        return player
            && player.vehicle
            && player.vehicle.mesh
            && player.vehicle.mesh.userData
            && player.vehicle.mesh.userData.object
            ? player.vehicle.mesh.userData.object
            : null;
    }

    /**
     * Snapshot the live session into a save payload.
     */
    capture() {
        const player = l.scenograph && l.scenograph.actors && l.scenograph.actors.player;
        const actorInstance = player && player.actorInstance;
        const hangarRef = actorInstance && actorInstance.config && actorInstance.config.hangar
            ? {
                structure: actorInstance.config.hangar.structure,
                hangarName: actorInstance.config.hangar.hangarName,
            }
            : null;

        const personObject = actorInstance && actorInstance.object;
        const aircraft = this.getAircraftObject();

        return {
            slot: this.activeSlot,
            appMode: l.mode === 'hangar' ? 'hangar' : 'single_player',
            controlMode: player && player.mode === 'person' ? 'person' : 'vehicle',
            hangar: hangarRef,
            person: personObject
                ? {
                    position: {
                        x: personObject.position.x,
                        y: personObject.position.y,
                        z: personObject.position.z,
                    },
                    rotation: {
                        x: personObject.rotation.x,
                        y: personObject.rotation.y,
                        z: personObject.rotation.z,
                    },
                }
                : null,
            aircraft: aircraft
                ? {
                    position: {
                        x: aircraft.position.x,
                        y: aircraft.position.y,
                        z: aircraft.position.z,
                    },
                    rotation: {
                        x: aircraft.rotation.x,
                        y: aircraft.rotation.y,
                        z: aircraft.rotation.z,
                    },
                    capacitor: aircraft.capacitor,
                    hitPoints: aircraft.hitPoints,
                    inventory: this.serialiseInventory( aircraft.inventory ),
                }
                : null,
            // Prefer locationInventory; hangarInventory kept for reading older saves.
            locationInventory: this.serialiseInventory(
                personObject && personObject.inventory ? personObject.inventory : null
            ),
        };
    }

    serialiseInventory( inventory ) {
        if ( ! inventory || ! inventory.slots ) {
            return null;
        }
        return inventory.slots.map( ( item ) => {
            if ( ! item ) {
                return null;
            }
            const entry = { id: item.id, name: item.name };
            if ( item.qty !== undefined ) {
                entry.qty = item.qty;
            }
            if ( item.charge !== undefined ) {
                entry.charge = item.charge;
            }
            if ( item.capacity !== undefined ) {
                entry.capacity = item.capacity;
            }
            return entry;
        } );
    }

    applyInventory( inventory, slots ) {
        if ( ! inventory || ! Array.isArray( slots ) ) {
            return;
        }
        if ( typeof inventory.applySlots === 'function' ) {
            inventory.applySlots( slots );
            return;
        }
        for ( let i = 0; i < inventory.size; i++ ) {
            const entry = slots[ i ];
            if ( ! entry ) {
                inventory.set( i, null );
                continue;
            }
            const item = { id: entry.id, name: entry.name || entry.id };
            if ( entry.qty !== undefined ) {
                item.qty = entry.qty;
            }
            if ( entry.charge !== undefined ) {
                item.charge = entry.charge;
            }
            if ( entry.capacity !== undefined ) {
                item.capacity = entry.capacity;
            }
            inventory.set( i, item );
        }
    }

    /**
     * YAML inventory seed for the player's assigned hangar (not a hangar-owned bag).
     */
    getLocationInventorySeed( hangarRef ) {
        const world = l.current_scene && l.current_scene.world;
        if ( ! world || typeof world.getHangarConfig !== 'function' ) {
            return null;
        }
        const config = world.getHangarConfig( hangarRef );
        return config && Array.isArray( config.inventory ) ? config.inventory : null;
    }

    /**
     * New Game: seed location bag from hangar YAML, aircraft cargo with starter crystals.
     */
    resetForNewGame( hangarRef ) {
        const person = this.getPersonObject();
        if ( person && person.inventory ) {
            person.inventory.clear();
            const seed = this.getLocationInventorySeed( hangarRef );
            if ( seed ) {
                person.applyInventory( seed );
            }
        }

        const aircraft = this.getAircraftObject();
        if ( aircraft ) {
            if ( aircraft.inventory && typeof aircraft.inventory.applySlots === 'function' ) {
                aircraft.inventory.applySlots( starterAircraftInventory() );
            }
            else if ( aircraft.inventory && typeof aircraft.inventory.clear === 'function' ) {
                aircraft.inventory.clear();
            }
            aircraft.capacitor = 1;
            aircraft.hitPoints = 100;
            aircraft.airSpeed = 0;
            aircraft.verticalSpeed = 0;
        }
    }

    /**
     * Apply a save payload onto the live player bags and pose.
     */
    apply( payload ) {
        if ( ! payload ) {
            return;
        }

        const player = l.scenograph && l.scenograph.actors && l.scenograph.actors.player;
        if ( ! player ) {
            return;
        }

        if ( payload.hangar && player.actorInstance && player.actorInstance.config ) {
            player.actorInstance.config.hangar = {
                structure: payload.hangar.structure,
                hangarName: payload.hangar.hangarName,
            };
        }

        const personObject = player.actorInstance && player.actorInstance.object;
        if ( personObject && payload.person ) {
            personObject.position.x = payload.person.position.x;
            personObject.position.y = payload.person.position.y;
            personObject.position.z = payload.person.position.z;
            personObject.rotation.x = payload.person.rotation.x;
            personObject.rotation.y = payload.person.rotation.y;
            personObject.rotation.z = payload.person.rotation.z;
        }

        const locationSlots = payload.locationInventory || payload.hangarInventory;
        if ( personObject && personObject.inventory && locationSlots ) {
            this.applyInventory( personObject.inventory, locationSlots );
        }

        const aircraft = this.getAircraftObject();
        if ( aircraft && payload.aircraft ) {
            aircraft.position.x = payload.aircraft.position.x;
            aircraft.position.y = payload.aircraft.position.y;
            aircraft.position.z = payload.aircraft.position.z;
            aircraft.rotation.x = payload.aircraft.rotation.x;
            aircraft.rotation.y = payload.aircraft.rotation.y;
            aircraft.rotation.z = payload.aircraft.rotation.z;
            if ( payload.aircraft.capacitor !== undefined ) {
                aircraft.capacitor = payload.aircraft.capacitor;
            }
            if ( payload.aircraft.hitPoints !== undefined ) {
                aircraft.hitPoints = payload.aircraft.hitPoints;
            }
            if ( payload.aircraft.inventory ) {
                this.applyInventory( aircraft.inventory, payload.aircraft.inventory );
            }
            player.vehicle.updateMesh();
        }
    }

    /**
     * Begin a play session from an empty slot (new) or an occupied one (continue).
     */
    async startSession( slot, mode ) {
        const isNew = mode === 'new';
        const existing = this.read( slot );

        this.emitStatus( 'loading', { slot, mode } );

        const defaults = this.cloneDefaults();
        if ( ! isNew && existing && existing.hangar ) {
            defaults.hangar = {
                structure: existing.hangar.structure,
                hangarName: existing.hangar.hangarName,
            };
            if ( existing.person && existing.person.position ) {
                defaults.position = { ...existing.person.position };
                defaults.rotation = { ...existing.person.rotation };
            }
        }

        await l.current_scene.spawnPlayer( defaults );
        this.activeSlot = slot;

        const hangarRef = defaults.hangar;

        if ( isNew ) {
            this.resetForNewGame( hangarRef );
            // Seed an immediate slot so Continue appears if they exit quickly.
            this.write( slot, this.capture() );
        }
        else if ( existing ) {
            this.apply( existing );
        }

        this.beginAutosave();
        return {
            appMode: isNew ? 'hangar' : ( existing && existing.appMode ) || 'hangar',
            controlMode: isNew ? 'person' : ( existing && existing.controlMode ) || 'person',
        };
    }

    endSession() {
        this.stopAutosave();
        if ( this.activeSlot !== null && ( l.mode === 'hangar' || l.mode === 'single_player' ) ) {
            this.saveNow( 'exit' );
        }
        this.activeSlot = null;
        if ( l.current_scene && typeof l.current_scene.despawnPlayer === 'function' ) {
            l.current_scene.despawnPlayer();
        }
    }

    beginAutosave() {
        this.stopAutosave();
        this.autosaveTimer = window.setInterval( () => {
            if ( this.activeSlot === null ) {
                return;
            }
            if ( l.mode !== 'hangar' && l.mode !== 'single_player' ) {
                return;
            }
            this.saveNow( 'interval' );
        }, AUTOSAVE_MS );
    }

    stopAutosave() {
        if ( this.autosaveTimer ) {
            window.clearInterval( this.autosaveTimer );
            this.autosaveTimer = null;
        }
    }

    /**
     * Capture and write the active slot. Used by autosave, transitions, and manual Save.
     */
    saveNow( reason ) {
        if ( this.activeSlot === null ) {
            return false;
        }
        if ( l.mode !== 'hangar' && l.mode !== 'single_player' && reason !== 'exit' ) {
            return false;
        }

        this.emitStatus( 'saving', { slot: this.activeSlot, reason } );
        const ok = this.write( this.activeSlot, this.capture() );
        if ( ok ) {
            this.emitStatus( 'saved', {
                slot: this.activeSlot,
                reason,
                manual: reason === 'manual',
            } );
        }
        return ok;
    }

    saveManual() {
        return this.saveNow( 'manual' );
    }

    /**
     * Ensure a World + scenograph player exists (debug menu / mid-session).
     */
    async ensurePlayerReady() {
        const existing = l.scenograph.actors.get( 'Player' );
        const worldPlayer = l.current_scene
            && l.current_scene.world
            && l.current_scene.world.getPlayer
            && l.current_scene.world.getPlayer();

        if ( existing && worldPlayer ) {
            l.scenograph.actors.player = existing;
            return existing;
        }

        const defaults = this.cloneDefaults();
        await l.current_scene.spawnPlayer( defaults );
        if ( this.activeSlot === null ) {
            this.activeSlot = 0;
            this.beginAutosave();
        }
        return l.scenograph.actors.player;
    }

    /**
     * Format a slot for the title picker.
     */
    slotSummary( payload ) {
        if ( ! payload ) {
            return {
                empty: true,
                title: 'Empty',
                detail: 'New Game',
            };
        }

        const modeLabel = payload.appMode === 'hangar' ? 'Hangar' : 'In flight';
        let when = '';
        if ( payload.updatedAt ) {
            try {
                // Compact stamp so three columns stay readable on phones.
                when = new Date( payload.updatedAt ).toLocaleString( undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                } );
            }
            catch ( error ) {
                when = payload.updatedAt;
            }
        }

        return {
            empty: false,
            title: modeLabel,
            detail: when,
        };
    }

}
