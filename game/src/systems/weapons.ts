/**
 * Weapons Systems
 * 
 * Defines an interface that fires a vehicles weapons.
 */


import BaseSystem from './base';

export default class Weapons extends BaseSystem {

    // Origin mesh that fired the missile.
    mesh;

    // Scanner systems that determine where we're firing.
    scanners;

    constructor( mesh, scanners, type = 'missile' ) {
        super( );

        this.mesh = mesh;

        this.scanners = scanners;

        if ( type == 'missile' ) {
            this.timeout = 1000; // in milliseconds
        }
    }

    // Check if we are ready to fire again.
    ready () {
        return parseInt( l.current_scene.stats.currentTime ) >= parseInt(this.last) + parseInt(this.timeout)
    }

    animate ( delta ) {

        if ( this.ready() ) {

            // Check scanners for objects to shoot at.
            // @todo: Move scanners into a game subsystem class.
            this.scanners.targets.forEach( ( target ) => {
                
                if (
                    // Check if the object is target locked and not friendly.
                    target.mesh.name != 'Missile' &&
                    target.locked && this.ready()
                ) {
                    this.last = l.current_scene.stats.currentTime;

                    console.log(this.mesh.name + " firing missile at " + target.mesh.name)

                    l.current_scene.objects.projectiles.missile.fireMissile(
                        this.mesh,
                        this.mesh.position,
                        target.mesh,
                        target.mesh.position
                    );
                }

            } );

        }

    }
}
