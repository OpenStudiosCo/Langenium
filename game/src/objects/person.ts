/**
 * Person class
 */

import ObjectBase from './base';
import BaseActor from '../actors/base2';
import Inventory from '../items/inventory';
import { changeVelocity, normaliseSpeedDelta, easeOutExpo, easeInQuad, easeInOutExpo } from '../helpers';
import { Vec3 } from '../types';


export default class Person extends ObjectBase {

    // Actor that controls this object.
    public actor?:          BaseActor;

    // Inventory at the player's assigned location (e.g. their hangar bay).
    public inventory:       Inventory                           = new Inventory( 8 );

    // Object world parameters
    public hitPoints:       number                              = 100;
    public airSpeed:        number                              = 0;
    public strafeSpeed:     number                              = 0;
    public verticalSpeed:   number                              = 0;
    public maxForward:      number                              = 16 / 60;    // 8 km/h @ 60 FPS
    public maxBackward:     number                              = 16 / 60;
    public maxStrafe:       number                              = 16 / 60;
    public maxUp:           number                              = 4 / 60;
    public maxDown:         number                              = 16 / 60;  // gravity?

    constructor() {
        super();
        this.aabb = {
            halfSize: { x: 0.5, y: 0.75, z: 0.3 }
        };
    }

    /**
     * Fill location storage from a YAML / save slot list.
     */
    applyInventory( items: any ): void {
        this.inventory.applySlots( items );
    }

    update( time_delta: number  ) {
        if (!this.actor) return;
        this.nextPosition = { ...this.position }; // start with current position

        let stepSize:           number = .025 * normaliseSpeedDelta( time_delta ),
            tX:                 number = 0,
            tZ:                 number = 0,
            tY:                 number = 0,
            heading:            number = this.rotation.y;

        if ( this.actor.controls.forward || this.actor.controls.back ){
            // Update Airspeed (horizontal velocity along facing)
            this.airSpeed = changeVelocity(
                stepSize * easeInOutExpo( 1 - ( Math.abs ( this.airSpeed ) / this.maxForward ) ),
                stepSize,
                this.airSpeed,
                this.actor.controls.forward,
                this.actor.controls.back,
                this.maxForward,
                this.maxBackward,
                easeOutExpo( 0.987 )
            );
        }
        else {
            this.airSpeed = 0;
        }

        if ( this.actor.controls.strafeLeft || this.actor.controls.strafeRight ) {
            // Lateral walk — same inverted velocity convention as forward/back.
            this.strafeSpeed = changeVelocity(
                stepSize * easeInOutExpo( 1 - ( Math.abs ( this.strafeSpeed ) / this.maxStrafe ) ),
                stepSize,
                this.strafeSpeed,
                this.actor.controls.strafeRight,
                this.actor.controls.strafeLeft,
                this.maxStrafe,
                this.maxStrafe,
                easeOutExpo( 0.987 )
            );
        }
        else {
            this.strafeSpeed = 0;
        }

        // Update Vertical Speed (velocity)
        this.verticalSpeed = changeVelocity(
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxUp ) ),
            stepSize * easeInOutExpo( 1 - ( Math.abs ( this.verticalSpeed ) / this.maxDown ) ),
            this.verticalSpeed,
            this.actor.controls.crouch,     // Note: Move Down/Up is reversed by design.
            this.actor.controls.jump,
            this.maxDown,
            this.maxUp,
            easeInQuad( 0.321 )
        );

        // Check the vertical speed exceeds minimum threshold for change in vertical position
        if (Math.abs(this.verticalSpeed) > 0.01) {
            tY = this.verticalSpeed;
        }

        if (Math.abs(this.airSpeed) > 0.01) {
            tZ = this.airSpeed;
        }

        if (Math.abs(this.strafeSpeed) > 0.01) {
            tX = this.strafeSpeed;
        }

        // Forward along facing; strafe along facing's right (negative speed = right).
        const xDiff = tZ * Math.sin( heading ) - tX * Math.cos( heading );
        const zDiff = tZ * Math.cos( heading ) + tX * Math.sin( heading );

        // "1" is the floor limit as it's the ocean surface and the camera clips through the water any lower.
        if (this.nextPosition.y + tY >= 1 ) {
            this.nextPosition.y += tY;
        } else {
            this.verticalSpeed = 0;
        }

        this.nextPosition.x += xDiff;
        this.nextPosition.z += zDiff;

        this.rY = 0;
        this.tY = tY;
        this.tZ = tZ;

    }

    commitNextPosition() {
        this.position = this.nextPosition;
    }

}
