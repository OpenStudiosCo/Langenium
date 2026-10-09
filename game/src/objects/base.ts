/**
 * Base Object class
 */

import { AABB, Vec3 } from '../types';

export default class ObjectBase {

    // World position and rotation.
    public position: Vec3 = { x: 0, y: 0, z: 0 };
    public rotation: Vec3 = { x: 0, y: 0, z: 0 };

    // Track next position (before collision check).
    public nextPosition:    Vec3 = { x: 0, y: 0, z: 0 };

    // Movement deltas.
    public rY: number = 0;
    public tY: number = 0;
    public tZ: number = 0;

    // Axis-Aligned Bounding Box.
    public aabb: AABB = {
        halfSize: { x: 0.5, y: 0.5, z: 0.5 }
    };

    // Whether to do a collision check.
    public solid: boolean = false;

    constructor() {
    }

    public getAABB() {
        return {
            min: {
                x: this.position.x - this.aabb.halfSize.x,
                y: this.position.y - this.aabb.halfSize.y,
                z: this.position.z - this.aabb.halfSize.z
            },
            max: {
                x: this.position.x + this.aabb.halfSize.x,
                y: this.position.y + this.aabb.halfSize.y,
                z: this.position.z + this.aabb.halfSize.z
            }
        };
    }

    public getAABBNext() {
        return {
            min: {
                x: this.nextPosition.x - this.aabb.halfSize.x,
                y: this.nextPosition.y - this.aabb.halfSize.y,
                z: this.nextPosition.z - this.aabb.halfSize.z
            },
            max: {
                x: this.nextPosition.x + this.aabb.halfSize.x,
                y: this.nextPosition.y + this.aabb.halfSize.y,
                z: this.nextPosition.z + this.aabb.halfSize.z
            }
        };
    }


}
