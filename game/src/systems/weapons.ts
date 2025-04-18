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
            this.timeout = 1000; // in milliseconds
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
                    l.current_scene.objects.projectiles.missile.fireMissile(
                        l.current_scene.objects.player.mesh,
                        l.current_scene.objects.player.mesh.position,
                        l.current_scene.objects.bot.mesh,
                        l.current_scene.objects.bot.mesh.position
                    );
                }

            } );

        }

    }
}
