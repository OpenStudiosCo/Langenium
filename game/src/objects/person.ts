/**
 * Base Aircraft class
 * 
 * @todo:
 * - Add weight and wind resistance
 */

import { normaliseSpeedDelta, easeOutExpo, easeInQuad, easeInOutExpo } from '../helpers';

export default class Person {
    public score:           { kills: number; deaths: number }   = { kills: 0, deaths: 0 };
    public standing:        number                              = 0;
    public hitPoints:       number                              = 100;
    public airSpeed:        number                              = 0;
    public verticalSpeed:   number                              = 0;
    public maxForward:      number                              = 16 / 60;    // 8 km/h @ 60 FPS
    public maxBackward:     number                              = 16 / 60;
    public maxUp:           number                              = 4 / 60;
    public maxDown:         number                              = 16 / 60;  // gravity?

    public position:        { x: number; y: number; z: number } = { x: 0, y: 8.5, z: 0 };
    public startPosition:   { x: number; y: number; z: number } = { x: 0, y: 8.5, z: 0 };
    public rotation:        { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

    public controls: {
        changing: boolean,
        forward: boolean;
        back: boolean;
        jump: boolean;
        crouch: boolean;
        turnLeft: boolean;
        turnRight: boolean;
    } = {
        changing: false,
        forward: false,
        back: false,
        jump: false,
        crouch: false,
        turnLeft: false,
        turnRight: false
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
        let stepSize:           number = .025 * normaliseSpeedDelta( time_delta ),
            rY:                 number = 0, 
            tZ:                 number = 0, 
            tY:                 number = 0,
            radian:             number = - (Math.PI / 180) * stepSize * 50;

        if ( this.controls.forward || this.controls.back ){
            // Update Airspeed (horizontal velocity)
            this.airSpeed = this._changeVelocity(
                stepSize * easeInOutExpo( 1 - ( Math.abs ( this.airSpeed ) / this.maxForward ) ),
                stepSize,
                this.airSpeed,
                this.controls.forward,
                this.controls.back,
                this.maxForward,
                this.maxBackward,
                easeOutExpo( 0.987 )
            );
        }
        else {
            this.airSpeed = 0;
        }
        

        // Update Vertical Speed (velocity)
        this.verticalSpeed = this._changeVelocity(
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxUp ) ),
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxDown ) ),
            this.verticalSpeed,
            this.controls.crouch,     // Note: Move Down/Up is reversed by design.
            this.controls.jump,
            this.maxDown,
            this.maxUp,
            easeInQuad( 0.321 )
        );

         // Check the vertical speed exceeds minimum threshold for change in vertical position
         if (Math.abs(this.verticalSpeed) > 0.01) {
            tY = this.verticalSpeed;
        }

        // Turning
        if (this.controls.turnRight) {
            rY += radian;
        }
        else {
            if (this.controls.turnLeft) {
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

        return [ rY, tY, tZ ];
    
    }

}
