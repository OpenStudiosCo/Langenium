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
            console.log('missile fired');
            this.lastAttack = currentTime;
        }

    }
}
