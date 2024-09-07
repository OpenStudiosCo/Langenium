/***
 * @name            List Targetable UI
 * @description     Target management
 * @namespace       l.ui.targeting.locked
 * @memberof        l.ui
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

export default class List {

    /**
     * Flag to pause UI updates when they're not necessary.
     */
    needsUpdate;

    constructor() {

        this.containerId = 'ui-targeting-list';
        this.container = document.getElementById( this.containerId );

        this.item_template = document.getElementById( 'targeting_list__item_template' ).innerHTML;

        this.needsUpdate = false;

    }


    /**
     * Update hook.
     * 
     * This method is called within the UI setInterval updater, allowing
     * HTML content to be updated at different rate than the 3D frame rate.
     * 
     * @method update
     * @memberof List
     * @global
     * @note All references within this method should be globally accessible.
    **/
    update() {

        // Check if we need to rebuild the target lock list HTML.
        if ( l.ui.targeting.list.needsUpdate ) {  

            // Populate the current target lock icons HTML.
            //l.ui.targeting.list.container.innerHTML = l.ui.targeting.list.getTargets();

            // Prevent re-run until next changes turn it back on.
            l.ui.targeting.list.needsUpdate = false;
        }

        // Update each of the targets info labels
        //l.ui.targeting.list.updateTargets()

    }

}