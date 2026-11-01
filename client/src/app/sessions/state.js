/**
 * @name            State
 * @description     Live single-player session flags and autosave timer.
 * @namespace       l.sessions.state
 * @memberof        l.sessions
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

const AUTOSAVE_MS = 60000;

export default class State {

    sessions;
    activeSlot;
    appMode;
    controlMode;
    autosaveTimer;

    constructor( sessions ) {
        this.sessions = sessions;
        this.activeSlot = null;
        this.appMode = null;
        this.controlMode = null;
        this.autosaveTimer = null;
    }

    isActive() {
        return this.activeSlot !== null;
    }

    noteModes( appMode, controlMode ) {
        if ( appMode !== undefined ) {
            this.appMode = appMode;
        }
        if ( controlMode !== undefined ) {
            this.controlMode = controlMode;
        }
    }

    clear() {
        this.activeSlot = null;
        this.appMode = null;
        this.controlMode = null;
    }

    beginAutosave() {
        this.stopAutosave();
        this.autosaveTimer = window.setInterval( () => {
            if ( ! this.isActive() ) {
                return;
            }
            if ( l.mode !== 'hangar' && l.mode !== 'single_player' ) {
                return;
            }
            this.sessions.saveNow( 'interval' );
        }, AUTOSAVE_MS );
    }

    stopAutosave() {
        if ( this.autosaveTimer ) {
            window.clearInterval( this.autosaveTimer );
            this.autosaveTimer = null;
        }
    }

}
