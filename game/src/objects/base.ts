/**
 * Base Object class
 */

import { AABB, Vec3 } from '../types';

export default class ObjectBase {

    // World position and rotation.
    public position: Vec3 = { x: 0, y: 0, z: 0 };
    public rotation: Vec3 = { x: 0, y: 0, z: 0 };

    // Movement deltas.
    public rY: number = 0;
    public tY: number = 0;
    public tZ: number = 0;

    // Axis-aligned bounding box
    public aabb: AABB = {
        halfSize: { x: 0.5, y: 0.5, z: 0.5 }
    };

    // Whether to do a collision check.
    public solid: boolean = false;

    constructor() {
    }

}
