/**
 * Valiant Aircraft, default ship and Kingdom of Winthrom main vehicle
 */

import ObjectBase from '../base';
import ActorBase from '../actors/base2';

import { changeVelocity, normaliseSpeedDelta, easeOutExpo, easeInQuad, easeInOutExpo } from '../../helpers';

class Valiant extends ObjectBase {

    // Actor that controls this object.
    public actor?:          ActorBase;

    // Object world parameters
    public hitPoints:       number                              = 100;
    public airSpeed:        number                              = 0;
    public verticalSpeed:   number                              = 0;
    public maxForward:      number                              = 16 / 60;    // 8 km/h @ 60 FPS
    public maxBackward:     number                              = 16 / 60;
    public maxUp:           number                              = 4 / 60;
    public maxDown:         number                              = 16 / 60;  // gravity?

    constructor( mesh ) {
        super( mesh ); // Call the constructor of the base class
    }

    /**
     * Move the aircraft based on velocity, direction and time delta between frames.
     *
     * @param time_delta
     */
    public update( time_delta: number ): object {
        if (!this.actor) return;
        let stepSize:           number = .05 * normaliseSpeedDelta( time_delta ),
            rY:                 number = 0,
            tZ:                 number = 0,
            tY:                 number = 0,
            radian:             number = (Math.PI / 180);

        // Update Airspeed (horizontal velocity)
        this.airSpeed = changeVelocity(
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.airSpeed ) / this.maxForward ) ),
            stepSize,
            this.airSpeed,
            this.actor.controls.throttleUp,
            this.actor.controls.throttleDown,
            this.maxForward,
            this.maxBackward,
            easeOutExpo( 0.987 )
        );

        // Update Vertical Speed (velocity)
        this.verticalSpeed = changeVelocity(
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxUp ) ),
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxDown ) ),
            this.verticalSpeed,
            this.actor.controls.moveDown,     // Note: Move Down/Up is reversed by design.
            this.actor.controls.moveUp,
            this.maxDown,
            this.maxUp,
            easeInQuad( 0.321 )
        );

         // Check the vertical speed exceeds minimum threshold for change in vertical position
         if (Math.abs(this.verticalSpeed) > 0.01) {
            tY = this.verticalSpeed;
        }

        // Turning
        if (this.actor.controls.moveLeft) {
            rY += radian;
        }
        else {
            if (this.actor.controls.moveRight) {
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
            !(this.actor.controls.throttleDown || this.actor.controls.throttleUp) &&
            !(this.actor.controls.moveDown || this.actor.controls.moveUp)
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

        this.rY = rY;
        this.tY = tY;
        this.tZ = tZ;

    }

}

module.exports = Valiant;
