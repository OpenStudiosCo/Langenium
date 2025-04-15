/**
 * Weapons Systems
 * 
 * Defines an interface that fires a vehicles weapons.
 */


import BaseSystem from './base';

export default class Weapons extends BaseSystem {

    lastAttack;
    timeout;

    constructor( type = 'missile' ) {
        super( type );

        if ( type == 'missile' ) {
            this.lastAttack = 0;
            this.timeout = 3000; // in milliseconds
        }
    }

    animate ( currentTime ) {

        if ( parseInt(currentTime) >= parseInt(this.lastAttack) + parseInt(this.timeout) ) {

            // Check scanners for objects to shoot at.
            // @todo: Move scanners into a game subsystem class.
            l.scenograph.overlays.scanners.trackedObjects.forEach( ( object ) => {
                
                if (
                    // Check if the object is target locked and not friendly.
                    object.locked && object.mesh.userData.standing < 0
                ) {
                    this.lastAttack = currentTime;
                    console.log('Firing missile!');
                }

            } );

        }

    }
}
