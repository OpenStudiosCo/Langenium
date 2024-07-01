/**
 * Debugging mode
 * 
 * Can be active for game modes and the home screen.
 */

import l from "@/helpers/l";

export default class Debugging {
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

        l.scenograph.controls.debug_on();

        l.ui.menus.debug_on();

        this.active = true;

    }

    deactivate() {

        l.scenograph.controls.debug_off();

        l.ui.menus.debug_off();

        this.active = false;

    }
}
