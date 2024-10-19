/***
 * @name            Targeting
 * @description     Manages the targeting list and locked UI components.
 * @namespace       l.ui.targeting
 * @memberof        l.ui
 * @global
 */

/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import List from '@/ui/targeting/list.js';
import Locked from '@/ui/targeting/locked.js';

export default class Targeting {

    constructor() {
        this.list = new List();
        this.locked = new Locked();
    }


    /**
     * Update hook.
     * 
     * This method is called within the UI setInterval updater, allowing
     * HTML content to be updated at different rate than the 3D frame rate.
     * 
     * @method update
     * @memberof Targeting_Scanner
     * @global
     * @note All references within this method should be globally accessible.
    **/
    update() {
        l.ui.targeting.locked.update();
        l.ui.targeting.list.update();
    }

}
