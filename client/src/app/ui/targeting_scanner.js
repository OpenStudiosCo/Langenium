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

        this.needsUpdate = false;

        // Create the targetting scanner container
        this.lineElement = document.createElement('div');
        this.lineElement.id = 'ui-targeting-container';
        this.lineElement.style.position = 'absolute';
        this.lineElement.style.background = 'rgba(0, 0, 0, 0.25)';
        this.lineElement.style.bottom = '1vh';
        this.lineElement.style.left = '35vw';
        this.lineElement.style.width = '30vw';
        this.lineElement.style.height = '10vh';
        this.lineElement.style.borderRadius = '1% / 5%'; // Makes the element circular for visibility
        this.lineElement.style.zIndex = '2'; // Ensures it's on top of other elements
        this.lineElement.style.pointerEvents = 'none';
        this.lineElement.innerHTML = ''; // blank initially set 
        document.body.appendChild(this.lineElement);
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
            let iconUrl = l.url + '/assets/ui/' + targetIcons[ target.mesh.name ];
            //debugger;
            targetsHTML += '<img width="20%" height="auto" src="' + iconUrl + '"/>';
            //targetsHTML += iconUrl;
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
            l.ui.targeting_scanner.lineElement.innerHTML = l.ui.targeting_scanner.getLockedTargets();

            // Prevent re-run until next changes turn it back on.
            l.ui.targeting_scanner.needsUpdate = false;
        }
    }

}