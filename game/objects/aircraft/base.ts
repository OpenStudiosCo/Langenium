/**
 * Base Aircraft class
 * 
 * @todo:
 * - Add weight and wind resistance
 */

import { normaliseSpeedDelta } from '../../helpers';

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

    public move( time_delta: number ): void {
        let stepSize:           number = .01 * normaliseSpeedDelta( time_delta ),
            rY:                 number = 0, 
            tZ:                 number = 0, 
            tY:                 number = 0,
            radian:             number = (Math.PI / 180),
            changingSpeed:      number = 0,
            changingElevator:   number = 0;

        // Forward and back
        if (this.controls.throttleUp) {
            this.airSpeed -= stepSize;
            changingSpeed = -1;
        }
        else {
            if (this.controls.throttleDown) {
                this.airSpeed += stepSize;
                changingSpeed = 1;
            }
            else {
                if (this.airSpeed != 0) {

                    if (Math.abs(this.airSpeed) > 0.1) {
                        this.airSpeed *= 0.987; //damping
                    }
                    else {
                        this.airSpeed = 0;
                    }
                }
                
            }
        }

        // Up and down
        if (this.controls.moveUp) {
            this.verticalSpeed += stepSize;
            changingElevator = 1;
        }
        else {
            if (this.controls.moveDown) {
                this.verticalSpeed -= stepSize;
                changingElevator = -1;
            }
            else {
                if (this.verticalSpeed != 0) {

                    if (Math.abs(this.verticalSpeed) > 0.1) {
                        this.verticalSpeed *= 0.987; //damping
                    }
                    else {
                        this.verticalSpeed = 0;
                    }
                }
            }
        }
    
    }
}

export default BaseAircraft;
