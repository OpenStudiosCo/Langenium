/**
 * Base Aircraft class
 * 
 * @todo:
 * - Add weight and wind resistance
 */

import { normaliseSpeedDelta, easeOutExpo, easeInQuad, easeInOutExpo } from '../../helpers';

export default class BaseAircraft {
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

    constructor() {
    }

    public blowUp( meshPosition ) {
        let seed = Math.round(Math.random() * 10);

        for ( var i = 0; i < seed; i++ ) {
            let xOffset = 10 - Math.random() * 20;
            let yOffset = 10 - Math.random() * 20;
            let zOffset = 10 - Math.random() * 20;

            let explosionPosition = meshPosition.clone();
            explosionPosition.x += xOffset;
            explosionPosition.y += yOffset;
            explosionPosition.z += zOffset;

            setTimeout( () => {
                l.current_scene.objects.projectiles.missile.loadExplosion( explosionPosition );
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

            // Hide the scanner marker during respawn.
            const scannerMarker = l.scenograph.overlays.scanners.trackedObjects[ this.mesh.uuid ];
            if ( scannerMarker )
                scannerMarker.style.display = 'none';


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

                // Restore the scanner marker after respawn.
                if ( scannerMarker )
                    scannerMarker.style.display = 'block';
            }, 3000 );

        }
        else {
            this.hitPoints -= damage;
        }

        return [ damage, targetDestroyed ];
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
     * Move the aircraft based on velocity, direction and time delta between frames.
     * 
     * @param time_delta 
     */
    public move( time_delta: number ): object {
        let stepSize:           number = .05 * normaliseSpeedDelta( time_delta ),
            rY:                 number = 0, 
            tZ:                 number = 0, 
            tY:                 number = 0,
            radian:             number = (Math.PI / 180);

        // Update Airspeed (horizontal velocity)
        this.airSpeed = this._changeVelocity(
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.airSpeed ) / this.maxForward ) ),
            stepSize,
            this.airSpeed,
            this.controls.throttleUp,
            this.controls.throttleDown,
            this.maxForward,
            this.maxBackward,
            easeOutExpo( 0.987 )
        );

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
