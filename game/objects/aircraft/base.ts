/**
 * Base Aircraft class
 * 
 * @todo:
 * - Add weight and wind resistance
 */

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

    public move(): void {
        
    }
}

export default BaseAircraft;
