/***
 * @name            Targeting Scanner
 * @description     Target list and management screen
 * @namespace       l.ui.targeting_scanner
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

export default class Targeting_Scanner {

    /**
     * Flag to pause UI updates when they're not necessary.
     */
    needsUpdate;

    constructor() {


        this.container = document.getElementById( 'ui-targeting-container' );

        this.item_template = document.getElementById( 'targeting_scanner__item_template' ).innerHTML;

        this.needsUpdate = false;

    }

    /**
     * Prepares a HTML row of locked targets
     * 
     * @uses l.scenograph.overlays.scanners.trackedObjects
     */
    getLockedTargets() {
        let targetsHTML = '';

        const targetIcons = {
            'Bot Ship': 'pirate-icon.png'
        }

        l.scenograph.overlays.scanners.trackedObjects.forEach( target => {
            // targetsHTML += '<div>';
            // let iconUrl = l.url + '/assets/ui/' + targetIcons[ target.mesh.name ];
            // //debugger;
            // targetsHTML += '<img style="display: block; filter: hue-rotate(73deg) brightness(4.0);" width="auto" height="50%" src="' + iconUrl + '"/>';
            // targetsHTML += '<strong>' + target.mesh.name + '</strong><br>';
            // targetsHTML += '100/100<br>';
            // targetsHTML += '</div>';
            targetsHTML += this.item_template;
        } );

        return targetsHTML;
    }

    /**
     * Update hook.
     * 
     * This method is called within the UI setInterval updater, allowing
     * HTML content to be updated at different rate than the 3D frame rate.
     * 
     * @method animate
     * @memberof Scanners
     * @global
     * @note All references within this method should be globally accessible.
    **/
    update() {
        if ( l.ui.targeting_scanner.needsUpdate ) {  

            // Populate the current target lock icons HTML.
            l.ui.targeting_scanner.container.innerHTML = l.ui.targeting_scanner.getLockedTargets();

            // Prevent re-run until next changes turn it back on.
            l.ui.targeting_scanner.needsUpdate = false;
        }
    }

}