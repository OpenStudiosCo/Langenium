/***
 * @name            List Targetable UI
 * @description     Target management
 * @namespace       l.ui.targeting.list
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

        this.containerId = '#ui-targeting-list tbody';
        this.container = document.querySelector( this.containerId );

        this.item_template = document.getElementById( 'targeting_list__item_template' ).innerHTML;

        this.needsUpdate = true;

    }

    getTable() {
        let html = '';

        const targetIcons = {
            'bot': 'aircraft.svg',
            'cargoShip': 'ship.svg',
            'city': 'structure.svg',
            'extractors': 'structure.svg',
            'player': 'aircraft.svg',
            'refinery': 'structure.svg',
        }

        const targetTypes = {
            'bot': 'Pirate Aircraft',
            'cargoShip': 'Cargo Ship',
            'city': 'Union Platform City',
            'extractors': 'Union Extractor',
            'refinery': 'Union Refinery',
        }

        l.current_scene.scene.traverse( mesh => {

            // Check if targetable and not the current player.
            let targetable = mesh.userData && mesh.userData.targetable ? true : false;
            if ( targetable && mesh.uuid != l.current_scene.objects.player.mesh.uuid ) {
                let item = JSON.parse( JSON.stringify( l.ui.targeting.list.item_template ) );

                let icon_class = '';

                // Add class of neutral of target stance is 0 (neutral)
                icon_class = mesh.userData.standing == 0 ? 'neutral' : '';

                item = item
                    .replaceAll( '$uuid', mesh.uuid )
                    .replaceAll( '$name', mesh.name )
                    .replaceAll( '$type', targetTypes[ mesh.userData.objectClass ] )
                    .replaceAll( '$icon_class', icon_class )
                    .replaceAll( '$url', l.url + '/assets/ui/targeting/list/' + targetIcons[ mesh.userData.objectClass ] );

                html += item;
            }
        } );

        return html;
    }

    sortTable( n ) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.querySelector( '#ui-targeting-list table' );
        switching = true;
        // Set the sorting direction to ascending:
        dir = "asc";
        /* Make a loop that will continue until
        no switching has been done: */
        while ( switching ) {
            // Start by saying: no switching is done:
            switching = false;
            rows = table.rows;
            /* Loop through all table rows (except the
            first, which contains table headers): */
            for ( i = 1; i < ( rows.length - 1 ); i++ ) {
                // Start by saying there should be no switching:
                shouldSwitch = false;
                /* Get the two elements you want to compare,
                one from current row and one from the next: */
                x = rows[ i ].getElementsByTagName( "TD" )[ n ];
                y = rows[ i + 1 ].getElementsByTagName( "TD" )[ n ];
                /* Check if the two rows should switch place,
                based on the direction, asc or desc: */
                if ( dir == "asc" ) {
                    if ( x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase() ) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                } else if ( dir == "desc" ) {
                    if ( x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase() ) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                }
            }
            if ( shouldSwitch ) {
                /* If a switch has been marked, make the switch
                and mark that a switch has been done: */
                rows[ i ].parentNode.insertBefore( rows[ i + 1 ], rows[ i ] );
                switching = true;
                // Each time a switch is done, increase this count by 1:
                switchcount++;
            } else {
                /* If no switching has been done AND the direction is "asc",
                set the direction to "desc" and run the while loop again. */
                if ( switchcount == 0 && dir == "asc" ) {
                    dir = "desc";
                    switching = true;
                }
            }
        }
    }

    updateTable() {
        let rows = document.querySelectorAll( l.ui.targeting.list.containerId + ' tr' );
        rows.forEach( targetIcon => {
            let targetObject = l.current_scene.scene.getObjectByProperty( 'uuid', targetIcon.dataset.uuid );

            // Update the distance to target.
            let distance = targetObject.position.distanceTo( l.current_scene.objects.player.mesh.position );
            if ( distance > 1000 ) {
                distance = Math.round( Math.round( distance ) / 10 ) / 100;
                targetIcon.querySelector( '.distance' ).innerHTML = distance + 'km';
            }
            else {
                distance = Math.round( distance );
                targetIcon.querySelector( '.distance' ).innerHTML = distance + 'm';
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
     * @memberof List
     * @global
     * @note All references within this method should be globally accessible.
    **/
    update() {

        // Check if we need to rebuild the target lock list HTML.
        if ( l.ui.targeting.list.needsUpdate ) {

            // Populate the current target lock icons HTML.
            l.ui.targeting.list.container.innerHTML = l.ui.targeting.list.getTable();

            // Prevent re-run until next changes turn it back on.
            l.ui.targeting.list.needsUpdate = false;
        }

        // Update each of the targets info labels
        l.ui.targeting.list.updateTable()

    }

}