/**
 * @name            Sessions
 * @description     Owns single-player session state, lifecycle and persistence policy.
 * @namespace       l.sessions
 * @memberof        l
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import PlayerDefaults from '#/game/src/scenes/playerDefaults';
import State from '@/sessions/state.js';
import Saves from '@/sessions/saves.js';

export default class Sessions {

    state;
    saves;
    statusListeners;

    constructor() {
        this.state = new State( this );
        this.saves = new Saves( this );
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
        return this.saves.getAircraftObject();
    }

    /**
     * New Game: seed facility storage + aircraft cargo from the player
     * blueprint. Location inventory lives on the person (structure-level
     * storage for e.g. Lambda City) — the same bag regardless of bay.
     */
    resetForNewGame() {
        const defaults = this.cloneDefaults();

        const person = this.getPersonObject();
        if ( person && person.inventory ) {
            person.inventory.clear();
            const locationSeed = defaults.hangar && defaults.hangar.inventory;
            if ( Array.isArray( locationSeed ) ) {
                person.applyInventory( locationSeed );
            }
        }

        const aircraft = this.getAircraftObject();
        if ( aircraft ) {
            const aircraftSeed = defaults.aircraft && defaults.aircraft.inventory;
            if ( aircraft.inventory && typeof aircraft.inventory.applySlots === 'function' ) {
                aircraft.inventory.applySlots(
                    Array.isArray( aircraftSeed ) ? aircraftSeed : []
                );
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
     * Begin a play session from an empty slot (new) or an occupied one (continue).
     */
    async start( slot, mode ) {
        const isNew = mode === 'new';
        const existing = this.saves.read( slot );

        if ( l.ui && l.ui.gameLog ) {
            l.ui.gameLog.clear();
        }

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
        this.state.activeSlot = slot;

        const appMode = isNew ? 'hangar' : ( existing && existing.appMode ) || 'hangar';
        const controlMode = isNew ? 'person' : ( existing && existing.controlMode ) || 'person';
        this.state.noteModes( appMode, controlMode );

        if ( isNew ) {
            this.resetForNewGame();
            // Seed an immediate slot so Continue appears if they exit quickly.
            this.saves.write( slot, this.saves.capture() );
        }
        else if ( existing ) {
            this.saves.apply( existing );
        }

        this.state.beginAutosave();
        return {
            appMode,
            controlMode,
            existing: isNew ? null : existing,
        };
    }

    /**
     * After route scaffolding has entered, restore Continue poses and stamp launch.
     */
    afterRouteEnter( existing ) {
        if ( existing ) {
            this.saves.apply( existing );
        }
        this.saveNow( 'launch' );
    }

    end() {
        this.state.stopAutosave();
        if ( this.state.isActive() && ( l.mode === 'hangar' || l.mode === 'single_player' ) ) {
            this.saveNow( 'exit' );
        }
        this.state.clear();
        if ( l.ui && l.ui.gameLog ) {
            l.ui.gameLog.clear();
        }
        if ( l.current_scene && typeof l.current_scene.despawnPlayer === 'function' ) {
            l.current_scene.despawnPlayer();
        }
    }

    /**
     * Capture and write the active slot. Used by autosave, transitions, and manual Save.
     */
    saveNow( reason ) {
        if ( ! this.state.isActive() ) {
            return false;
        }
        if ( l.mode !== 'hangar' && l.mode !== 'single_player' && reason !== 'exit' ) {
            return false;
        }

        const slot = this.state.activeSlot;
        this.emitStatus( 'saving', { slot, reason } );
        const ok = this.saves.write( slot, this.saves.capture() );
        if ( ok ) {
            this.emitStatus( 'saved', {
                slot,
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
        if ( ! this.state.isActive() ) {
            this.state.activeSlot = 0;
            this.state.noteModes(
                l.mode === 'single_player' ? 'single_player' : 'hangar',
                'person'
            );
            this.state.beginAutosave();
        }
        return l.scenograph.actors.player;
    }

}
