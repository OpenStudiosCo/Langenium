/**
 * Base Aircraft class
 * 
 * @todo:
 * - Add weight and wind resistance
 */

import { normaliseSpeedDelta } from '../../../helpers';

class BaseAircraft {
    public airSpeed:        number                              = 0;
    public verticalSpeed:   number                              = 0;
    public heading:         number                              = 0;
    public altitude:        number                              = 0;
    public horizon:         [number, number]                    = [0, 0];
    public position:        { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

    public controls: {
        throttleUp: boolean;
        throttleDown: boolean;
        moveUp: boolean;
        moveDown: boolean;
        moveLeft: boolean;
        moveRight: boolean;
    } = {
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
    public move( time_delta: number ): void {
        let stepSize:           number = .01 * normaliseSpeedDelta( time_delta ),
            rY:                 number = 0, 
            tZ:                 number = 0, 
            tY:                 number = 0,
            radian:             number = (Math.PI / 180),
            changingElevator:   number = 0;

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
    
    }
}

export default BaseAircraft;
