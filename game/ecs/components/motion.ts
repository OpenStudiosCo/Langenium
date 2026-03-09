// components/Motion.ts

export interface Motion {
    // Used by the Movement System to limit changes.
    limits: {
        acceleration: {
            forward: number,
            backward: number,
            up: number,
            down: number
        },
        velocity: {
            forward: number,
            backward: number,
            up: number,
            down: number
        }

    };

    velocity: {
        horizontal: number; // forward/back thrust
        vertical: number;   // up/down thrust
    };

    altitude: number;       // current altitude above sea level in metres.
    heading: number;        // yaw in radians
}
