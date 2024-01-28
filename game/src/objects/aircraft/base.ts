/**
 * Base Aircraft class
 * 
 * @todo:
 * - Add weight and wind resistance
 */

import { normaliseSpeedDelta } from '../../../helpers';

export default class BaseAircraft {
    public airSpeed:        number                              = 0;
    public verticalSpeed:   number                              = 0;
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
    private _changeVelocity(stepSize, currentVelocity, increasePushed, decreasePushed): number {
        let newVelocity = currentVelocity;

        if (increasePushed) {
            newVelocity -= stepSize;
        }
        else {
            if (decreasePushed) {
                newVelocity += stepSize;
            }
            else {
                if (newVelocity != 0) {

                    if (Math.abs(newVelocity) > 0.1) {
                        newVelocity *= 0.987; //damping
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
        let stepSize:           number = .01 * normaliseSpeedDelta( time_delta ),
            rY:                 number = 0, 
            tZ:                 number = 0, 
            tY:                 number = 0,
            radian:             number = (Math.PI / 180);

        // Update Airspeed (horizontal velocity)
        this.airSpeed = this._changeVelocity(
            stepSize,
            this.airSpeed,
            this.controls.throttleUp,
            this.controls.throttleDown
        );

        // Update Vertical Speed (velocity)
        this.verticalSpeed = this._changeVelocity(
            stepSize,
            this.verticalSpeed,
            this.controls.moveDown,     // Note: Move Down/Up is reversed by design.
            this.controls.moveUp
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
