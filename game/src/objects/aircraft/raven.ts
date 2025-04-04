/**
 * Raven Aircraft, default ship and Los Zaar main vehicle.
 */

import BaseAircraft from './base';

class Raven extends BaseAircraft {

    public maxForward:      number                              = 3.7 * 5;    // Reading as 200 knots on the airspeed instrument, may not be correct.
    public maxBackward:     number                              = 2.0;
    public maxUp:           number                              = 3.7 * 2.5;
    public maxDown:         number                              = 3.7 * 5;  // gravity?

    constructor() {
        super(); // Call the constructor of the base class
    }

}

module.exports = Raven;
