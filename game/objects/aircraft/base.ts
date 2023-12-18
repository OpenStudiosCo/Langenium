/**
 * Base Aircraft class
 * 
 * @todo:
 * - Add weight and wind resistance
 */

class BaseAircraft {
    public airSpeed:        number                      = 0;
    public verticalSpeed:   number                      = 0;
    public heading:         number                      = 0;
    public altitude:        number                      = 0;
    public horizon:         [number, number]            = [0, 0];
    public position:        { x: 0, y: 0, z: 0 };
    public controlState:    {
        throttleUp:     false,
        throttleDown:   false,
        moveUp:         false,
        moveBack:       false,
        moveLeft:       false,
        moveRight:      false
    }

    constructor() {
        
    }

    public move(): void {
        
    }
}

export default BaseAircraft;
