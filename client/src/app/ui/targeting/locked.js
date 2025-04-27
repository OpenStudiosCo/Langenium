/***
 * @name            Locked Targets UI
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

export default class Locked {

    /**
     * Flag to pause UI updates when they're not necessary.
     */
    needsUpdate;

    constructor() {

        this.containerId = 'ui-targeting-locked';
        this.container = document.getElementById( this.containerId );

        this.item_template = document.getElementById( 'targeting_locked__item_template' ).innerHTML;

        this.needsUpdate = false;

    }

    /**
     * Prepares a HTML row of locked targets
     * 
     * @uses l.scenograph.overlays.scanners.trackedObjects
     */
    getTargets() {
        let targetsHTML = '';

        const targetIcons = {
            'bot': 'pirate-icon.png',
            'cargoShip': 'cargo-ship-icon.png',
            'city': 'city-icon.png',
            'extractors': 'extractor-icon.png',
            'player': 'mercenary-icon.png',
            'refineries': 'refinery-icon.png',
        }

        l.scenograph.overlays.scanners.trackedObjects.forEach( target => {

            let item = JSON.parse( JSON.stringify( l.ui.targeting.locked.item_template ) );

            let icon_class = '';

            // Add class of neutral of target stance is 0 (neutral)
            icon_class = target.mesh.userData.hasOwnProperty('object') &&
                         target.mesh.userData.object.hasOwnProperty('standing') &&
                         target.mesh.userData.object.standing == 0 ? 'neutral' : '';

            item = item
                .replaceAll( '$uuid', target.mesh.uuid )
                .replaceAll( '$name', target.mesh.name )
                .replaceAll( '$icon_class', icon_class )
                .replaceAll( '$url', l.url + '/assets/ui/' + targetIcons[ target.mesh.userData.objectClass ] );

            targetsHTML += item;
        } );

        return targetsHTML;
    }

    updateTargets() {
        let targetIcons = document.querySelectorAll( '#' + l.ui.targeting.locked.containerId + ' .target' );
        targetIcons.forEach( targetIcon => {
            let targetObject = l.current_scene.scene.getObjectByProperty( 'uuid', targetIcon.dataset.uuid);

            // Update the distance to target.
            let distance = targetObject.position.distanceTo( l.current_scene.objects.player.mesh.position );
            if ( distance > 1000 ) {
                distance = Math.round(Math.round(distance) / 10) / 100;
                targetIcon.querySelector('.distance').innerHTML = distance + 'km';
            }
            else {
                distance = Math.round(distance);
                targetIcon.querySelector('.distance').innerHTML = distance + 'm';
            }
        } );        
    }

    /**
     * Update hook.
     * 
     * This method is called within the UI setInterval updater, allowing
     * HTML content to be updated at different rate than the 3D frame rate.
     * 
     * @method update
     * @memberof Locked
     * @global
     * @note All references within this method should be globally accessible.
    **/
    update() {

        // Check if we need to rebuild the target lock list HTML.
        if ( l.ui.targeting.locked.needsUpdate ) {  

            // Populate the current target lock icons HTML.
            l.ui.targeting.locked.container.innerHTML = l.ui.targeting.locked.getTargets();

            // Prevent re-run until next changes turn it back on.
            l.ui.targeting.locked.needsUpdate = false;
        }

        // Update each of the targets info labels
        l.ui.targeting.locked.updateTargets()

    }

}