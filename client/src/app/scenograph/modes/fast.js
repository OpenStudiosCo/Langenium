/**
 * Fast mode
 * 
 * Can be active for game modes and the home screen.
 */

import l from "../../helpers/l";

export default class Fast {
    active;

    constructor() {
        this.active = false;
    }

    // Toggle debugging mode on and off.
    toggle() {

        if ( this.active ) {
            this.deactivate();
        }
        else {
            this.activate();
        }

    }

    activate() {
        if ( ! l.current_scene.effects.postprocesing ) {
            l.scenograph.effects.init();
        }

        this.active = true;

    }

    deactivate() {


        this.active = false;

    }
}
