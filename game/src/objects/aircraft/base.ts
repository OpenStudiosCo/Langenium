/**
 * Base Aircraft class
 * 
 * @todo:
 * - Add weight and wind resistance
 */

import { normaliseSpeedDelta, easeOutExpo, easeInQuad, easeInOutExpo } from '../../../helpers';

export default class BaseAircraft {
    public airSpeed:        number                              = 0;
    public verticalSpeed:   number                              = 0;
    public maxForward:      number                              = 3.7 * 5;    // Reading as 200 knots on the airspeed instrument, may not be correct.
    public maxBackward:     number                              = 0.5;
    public maxUp:           number                              = .4;
    public maxDown:         number                              = .4;  // gravity?
    public heading:         number                              = 0;
    public altitude:        number                              = 0;
    public horizon:         [number, number]                    = [0, 0];
    public position:        { x: number; y: number; z: number } = { x: 0, y: 8.5, z: 0 };
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
            stepSize,
            stepSize,
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
