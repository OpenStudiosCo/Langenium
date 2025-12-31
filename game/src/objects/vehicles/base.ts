/**
 * Base Aircraft class
 *
 * @todo:
 * - Add weight and wind resistance
 */

import { normaliseSpeedDelta, easeOutExpo, easeInQuad, easeInOutExpo } from '../../helpers';

export default class BaseAircraft {
    public mesh;
    public score:           { kills: number; deaths: number }   = { kills: 0, deaths: 0 };
    public standing:        number                              = 0;
    public hitPoints:       number                              = 100;
    public airSpeed:        number                              = 0;
    public verticalSpeed:   number                              = 0;
    public maxForward:      number                              = 3.7 * 5;    // Reading as 200 knots on the airspeed instrument, may not be correct.
    public maxBackward:     number                              = 2.0;
    public maxUp:           number                              = 3.7 * 2.5;
    public maxDown:         number                              = 3.7 * 5;  // gravity?
    // @todo: Introduce max turn speed for the vehicle
    public heading:         number                              = 0;
    public altitude:        number                              = 0;
    public horizon:         [number, number]                    = [0, 0];
    public position:        { x: number; y: number; z: number } = { x: 0, y: 8.5, z: 0 };
    public startPosition:   { x: number; y: number; z: number } = { x: 0, y: 8.5, z: 0 };
    public rotation:        { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

    public controls: {
        changing: boolean,
        throttleUp: boolean;
        throttleDown: boolean;
        moveUp: boolean;
        moveDown: boolean;
        moveLeft: boolean;
        moveRight: boolean;
    } = {
        changing: false,
        throttleUp: false,
        throttleDown: false,
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false
    };

    constructor( mesh ) {
        this.mesh = mesh;
    }

    public blowUp( meshPosition ) {
        let seed = Math.round(Math.random() * 10);

        if ( window.location.pathname == 'https://langenium.com' && l.config.settings.fast == false ) {
          for ( var i = 0; i < seed; i++ ) {
              let xOffset = 10 - Math.random() * 20;
              let yOffset = 10 - Math.random() * 20;
              let zOffset = 10 - Math.random() * 20;

              let explosionPosition = meshPosition.clone();
              explosionPosition.x += xOffset;
              explosionPosition.y += yOffset;
              explosionPosition.z += zOffset;

              setTimeout( () => {
                  l.scenograph.objects.projectiles.missile.loadExplosion( explosionPosition );
              }, 250 * Math.random() )

          }
        }
        else {
          setTimeout( () => {
              l.scenograph.objects.projectiles.missile.loadExplosion( meshPosition );
          }, 250 * Math.random() )
        }

    };

    /**
     * Damages the aircraft based on the incoming damage.
     *
     * Returns the calculated final damage amount.
     *
     * @param damagePoints
     * @param originMesh
     * @returns
     */
    public damage( damagePoints, originMesh ): number {
        let targetDestroyed = false;
        let damage = damagePoints;
        let seed = Math.random();

        // Critical Fail
        if ( seed < 0.05 ) {
            damage = 0;
        }

        // Critical Success
        if ( seed > 0.95 ) {
            damage = damage * 2;
        }

        // Apply damage to the aircrafts hitpoints.
        if ( this.hitPoints <= damage ) {
            targetDestroyed = true;
            this.hitPoints = 0;
            // Add an explosion special effect
            // @todo: v7 Figure out a way to signal this to happen without l. global object access
            this.blowUp( this.mesh.position );

            // Disable targeting until respawn.
            this.mesh.userData.targetable = false;
            this.mesh.visible = false;

            // Remove respective target locks as the target object is 'dead' / being reset.
            originMesh.userData.actor.scanners.untrackTarget( this.mesh.uuid );
            this.mesh.userData.actor.scanners.untrackTarget( originMesh.uuid );

            // Update scores.
            this.score.deaths += 1;
            originMesh.userData.object.score.kills += 1;

            // Wait 3 seconds before 'respawn'.
            setTimeout( () => {
                // Reset hitpoints
                this.hitPoints = 100;

                // Reset object to start position,rotation and speed.
                this.mesh.userData.actor.entity.position.x = this.startPosition.x;
                this.mesh.userData.actor.entity.position.y = this.startPosition.y;
                this.mesh.userData.actor.entity.position.z = this.startPosition.z;
                this.rotation.x = 0;
                this.rotation.y = 0;
                this.rotation.z = 0;
                this.airSpeed = 0;
                this.verticalSpeed = 0;

                // Re-enable targeting after respawn.
                this.mesh.userData.targetable = true;
                this.mesh.visible = true;

            }, 3000 );

        }
        else {
            this.hitPoints -= damage;
        }

        return [ damage, targetDestroyed ];
    }


}
