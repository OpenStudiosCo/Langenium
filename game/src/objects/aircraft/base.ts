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
    public respawning:      boolean                             = false;
    public airSpeed:        number                              = 0;
    public verticalSpeed:   number                              = 0;
    public maxForward:      number                              = 3.7 * 5;    // Reading as 200 knots on the airspeed instrument, may not be correct.
    public maxBackward:     number                              = 2.0;
    public maxUp:           number                              = 3.7 * 2.5;
    public maxDown:         number                              = 3.7 * 5;  // gravity?
    public cruiseForward:   number                              = 400 / 60;   // Cap before overdrive (~400 km/h HUD @ 60 FPS).
    public capacitor:       number                              = 1;          // 0..1 charge; overdrive while > 0.
    public capacitorDrainPerSecond:     number                  = 1 / 30;     // Full tank lasts 30s in overdrive.
    public capacitorRechargePerSecond:  number                  = 1 / 180;    // Full recharge takes 3 minutes under cruise.
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
        if ( this.respawning ) {
            return [ 0, false ];
        }

        if ( this.hitPoints <= damage ) {
            targetDestroyed = true;
            this.hitPoints = 0;
            this.respawning = true;
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

            this.airSpeed = 0;
            this.verticalSpeed = 0;
            this.capacitor = 1;
            this.controls.changing = false;
            this.controls.throttleUp = false;
            this.controls.throttleDown = false;
            this.controls.moveUp = false;
            this.controls.moveDown = false;
            this.controls.moveLeft = false;
            this.controls.moveRight = false;

            const active = l.scenograph.actors.player;
            const playerDown = active
                && active.vehicle
                && this.mesh === active.vehicle.mesh
                && active.mode === 'vehicle'
                && l.mode !== 'home'
                && l.mode !== 'hangar';

            // Wait 3 seconds before 'respawn'.
            setTimeout( () => {
                this.hitPoints = 100;
                this.respawning = false;

                if ( playerDown && l.scenograph.hangar && l.mode !== 'home' ) {
                    l.scenograph.hangar.enterHangar();
                    return;
                }

                this.respawnAtStart();
            }, 3000 );

        }
        else {
            this.hitPoints -= damage;
        }

        return [ damage, targetDestroyed ];
    }

    /**
     * Bring this craft back at its start, on its existing patrol.
     * Player ships and the demo tour stay hidden unless that craft is in play.
     */
    respawnAtStart() {
        const actor = this.mesh.userData.actor;
        const entity = actor && actor.entity;
        if ( entity ) {
            entity.position.set( this.startPosition.x, this.startPosition.y, this.startPosition.z );
            if ( entity.velocity ) {
                entity.velocity.set( 0, 0, 0 );
            }
        }

        this.rotation.x = 0;
        this.rotation.y = 0;
        this.rotation.z = 0;
        this.airSpeed = 0;
        this.verticalSpeed = 0;
        this.capacitor = 1;

        const demo = l.current_scene.objects.demoTour;
        let sessionShip = demo && this.mesh === demo.mesh;
        if ( l.scenograph.actors ) {
            for ( const pilot of l.scenograph.actors.getAll() ) {
                if ( pilot.vehicle && pilot.vehicle.mesh === this.mesh ) {
                    sessionShip = true;
                }
            }
        }

        let inWorld = true;
        if ( sessionShip ) {
            const active = l.scenograph.actors.player;
            const demoInWorld = demo && this.mesh === demo.mesh && ( ! l.mode || l.mode === 'home' );
            const playerInWorld = active && active.mode === 'vehicle' && active.vehicle && this.mesh === active.vehicle.mesh;
            inWorld = demoInWorld || playerInWorld;
        }

        this.mesh.userData.targetable = inWorld;
        this.mesh.visible = inWorld;
    }

    /**
     * Change aircraft velocity based on current and what buttons are pushed by the player.
     *
     * @param currentVelocity
     * @param increasePushed
     * @param decreasePushed
     */
    private _changeVelocity(stepIncrease, stepDecrease, currentVelocity, increasePushed, decreasePushed, increaseMax, decreaseMax, dragFactor): number {
        let newVelocity = currentVelocity;

        if (increasePushed) {

            // Check if the change puts us over the max.
            let tempVelocity = newVelocity - stepIncrease;
            if (Math.abs(increaseMax) >= Math.abs(tempVelocity))
                newVelocity = tempVelocity;
        }
        else {
            if (decreasePushed) {

                // Check if the change puts us over the max.
                let tempVelocity = newVelocity + stepDecrease;
                if (Math.abs(decreaseMax) >= tempVelocity)
                    newVelocity = tempVelocity;
            }
            else {
                if (newVelocity != 0) {

                    if (Math.abs(newVelocity) > 0.1) {
                        // Ease out the velocity exponentially to simulate drag
                        newVelocity *= dragFactor;
                    }
                    else {
                        newVelocity = 0;
                    }
                }

            }
        }

        return newVelocity;
    }

    /**
     * Convert move() time_delta to seconds.
     * Client clock uses seconds; server instance uses milliseconds.
     *
     * @param time_delta
     */
    private _deltaSeconds( time_delta: number ): number {
        let seconds: number = 1 / 60;

        if ( time_delta && time_delta > 0 ) {
            seconds = time_delta > 1 ? time_delta / 1000 : time_delta;
            if ( seconds > 0.05 ) {
                seconds = 0.05;
            }
        }

        return seconds;
    }

    /**
     * Move the aircraft based on velocity, direction and time delta between frames.
     *
     * @param time_delta
     */
    public move( time_delta: number ): object {
        let stepSize:           number = .05 * normaliseSpeedDelta( time_delta ),
            rY:                 number = 0,
            tZ:                 number = 0,
            tY:                 number = 0,
            radian:             number = (Math.PI / 180),
            dtSeconds:          number = this._deltaSeconds( time_delta ),
            cruiseCap:          number = Math.min( this.maxForward, this.cruiseForward ),
            effectiveMaxForward: number = this.capacitor > 0 ? this.maxForward : cruiseCap,
            sign:               number = 0,
            excess:             number = 0;

        // Update Airspeed (horizontal velocity)
        this.airSpeed = this._changeVelocity(
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.airSpeed ) / effectiveMaxForward ) ),
            stepSize,
            this.airSpeed,
            this.controls.throttleUp,
            this.controls.throttleDown,
            effectiveMaxForward,
            this.maxBackward,
            easeOutExpo( 0.987 )
        );

        // Drain capacitor above cruise; recharge while at or under cruise.
        if ( Math.abs( this.airSpeed ) > this.cruiseForward ) {
            this.capacitor = Math.max( 0, this.capacitor - this.capacitorDrainPerSecond * dtSeconds );
            if ( this.capacitor <= 0 && Math.abs( this.airSpeed ) > cruiseCap ) {
                // Ease back to cruise instead of snapping.
                sign = this.airSpeed < 0 ? -1 : 1;
                excess = Math.abs( this.airSpeed ) - cruiseCap;
                this.airSpeed = sign * ( cruiseCap + excess * Math.pow( 0.92, dtSeconds * 60 ) );
                if ( Math.abs( this.airSpeed ) - cruiseCap < 0.01 ) {
                    this.airSpeed = sign * cruiseCap;
                }
            }
        }
        else {
            this.capacitor = Math.min( 1, this.capacitor + this.capacitorRechargePerSecond * dtSeconds );
        }

        // Update Vertical Speed (velocity)
        this.verticalSpeed = this._changeVelocity(
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxUp ) ),
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxDown ) ),
            this.verticalSpeed,
            this.controls.moveDown,     // Note: Move Down/Up is reversed by design.
            this.controls.moveUp,
            this.maxDown,
            this.maxUp,
            easeInQuad( 0.321 )
        );

         // Check the vertical speed exceeds minimum threshold for change in vertical position
         if (Math.abs(this.verticalSpeed) > 0.01) {
            tY = this.verticalSpeed;
        }

        // Turning
        if (this.controls.moveLeft) {
            rY += radian;
        }
        else {
            if (this.controls.moveRight) {
                rY -= radian;
            }
        }

        // Check if we have significant airspeed
        if (Math.abs(this.airSpeed) > 0.01) {

            // Set change in Z position based on airspeed
            tZ = this.airSpeed;

        }

        // Animate the ship's rotation in the game client based on controls.
        if (
            !(this.controls.throttleDown || this.controls.throttleUp) &&
            !(this.controls.moveDown || this.controls.moveUp)
        ) {
            this.rotation.x *= .9;
        }

        if (rY != 0) {
            if (Math.abs(this.rotation.z) < Math.PI / 4) {
                this.rotation.z += rY / Math.PI;
            }

            this.rotation.y += rY;
        }
        else {
            this.rotation.z *= .9;
        }

        let xDiff = tZ * Math.sin(this.rotation.y),
            zDiff = tZ * Math.cos(this.rotation.y);

        // "1" is the floor limit as it's the ocean surface and the camera clips through the water any lower.
        if (this.position.y + tY >= 1 ) {
            this.position.y += tY;
        } else {
            this.verticalSpeed = 0;
        }

        this.position.x += xDiff;
        this.position.z += zDiff;

        return [ rY, tY, tZ ];

    }

}
