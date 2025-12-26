/**
 * Base Aircraft class
 *
 * @todo:
 * - Add weight and wind resistance
 */

import BaseActor from '../actors/base2';
import { changeVelocity, normaliseSpeedDelta, easeOutExpo, easeInQuad, easeInOutExpo } from '../helpers';

export default class Person {

    public actor?:          BaseActor;

    public hitPoints:       number                              = 100;
    public airSpeed:        number                              = 0;
    public verticalSpeed:   number                              = 0;
    public maxForward:      number                              = 16 / 60;    // 8 km/h @ 60 FPS
    public maxBackward:     number                              = 16 / 60;
    public maxUp:           number                              = 4 / 60;
    public maxDown:         number                              = 16 / 60;  // gravity?

    public position:        { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
    public rotation:        { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

    public rY: number = 0;
    public tY: number = 0;
    public tZ: number = 0;

    constructor() {
    }

    update( time_delta: number  ) {

        if (this.actor) {
            let stepSize:           number = .025 * normaliseSpeedDelta( time_delta ),
                rY:                 number = 0,
                tZ:                 number = 0,
                tY:                 number = 0,
                radian:             number = - (Math.PI / 180) * stepSize * 100;

            if ( this.actor.controls.forward || this.actor.controls.back ){
                // Update Airspeed (horizontal velocity)
                this.airSpeed = changeVelocity(
                    stepSize * easeInOutExpo( 1 - ( Math.abs ( this.airSpeed ) / this.maxForward ) ),
                    stepSize,
                    this.airSpeed,
                    this.actor.controls.forward,
                    this.actor.controls.back,
                    this.maxForward,
                    this.maxBackward,
                    easeOutExpo( 0.987 )
                );
            }
            else {
                this.airSpeed = 0;
            }

            // Update Vertical Speed (velocity)
            this.verticalSpeed = changeVelocity(
                stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxUp ) ),
                stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxDown ) ),
                this.verticalSpeed,
                this.actor.controls.crouch,     // Note: Move Down/Up is reversed by design.
                this.actor.controls.jump,
                this.maxDown,
                this.maxUp,
                easeInQuad( 0.321 )
            );

            // Check the vertical speed exceeds minimum threshold for change in vertical position
            if (Math.abs(this.verticalSpeed) > 0.01) {
                tY = this.verticalSpeed;
            }

            // Turning
            if (this.actor.controls.turnRight) {
                rY += radian;
            }
            else {
                if (this.actor.controls.turnLeft) {
                    rY -= radian;
                }
            }

            // Check if we have significant airspeed
            if (Math.abs(this.airSpeed) > 0.01) {

                // Set change in Z position based on airspeed
                tZ = this.airSpeed;

            }

            if (rY != 0) {
                if (Math.abs(this.rotation.z) < Math.PI / 4) {
                    this.rotation.z += rY / Math.PI;
                }

                this.rotation.y += rY;
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

}
