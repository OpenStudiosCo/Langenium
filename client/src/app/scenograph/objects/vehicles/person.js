/**
 * Person object.
 *
 * Rig to be used like a vehicle when in first person mode.
 *
 * @todo: Add some limbs or a body model to see.
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class Person {

    constructor(actorEntity) {


        this.default_camera_distance = l.scenograph.width < l.scenograph.height ? -5 : -2.5;

        this.camera_distance = 0;

        this.mesh = new THREE.Object3D();
    }

    get(actorEntity) {
        // Set internal game accessor to the game world actor instance.
        this.game = actorEntity;
        return this.mesh;
    }

    // Internal helper to manage state changes to the person's character model.
    updateControls() {
        let mappings = {
            forward     :  'W',
            back        :  'S',
            jump        :  ' ',
            crouch      :  'shift',
            turnLeft    :  'A',
            turnRight   :  'D',
        }
        let changing = false;
        for ( const [ controlName, keyMapping ] of Object.entries( mappings ) ) {
            if ( l.scenograph.controls.keyboard.pressed( keyMapping ) ) {
                this.game.actor.controls[ controlName ] = true;
                changing = true;
            }
            else {

                this.game.actor.controls[ controlName ] = false;

                if ( l.scenograph.controls.touch ) {
                    // Check if any touchpad controls are being pressed
                    if (
                        l.scenograph.controls.touch.controls.moveUp ||
                        l.scenograph.controls.touch.controls.moveDown ||
                        l.scenograph.controls.touch.controls.moveForward ||
                        l.scenograph.controls.touch.controls.moveBackward ||
                        l.scenograph.controls.touch.controls.moveLeft ||
                        l.scenograph.controls.touch.controls.moveRight
                    ) {
                        changing = true;
                        if ( l.scenograph.controls.touch.controls.moveForward ) {
                            this.game.actor.controls.forward = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveBackward ) {
                            this.game.actor.controls.back = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveUp ) {
                            this.game.actor.controls.jump = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveDown ) {
                            this.game.actor.controls.crouch = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveLeft ) {
                            this.game.actor.controls.turnLeft = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveRight ) {
                            this.game.actor.controls.turnRight = true;
                        }
                    }

                }
            }
        }
        this.game.actor.controls.changing = changing;

    }

    // Synchronise mesh with game world object.
    sync() {
        this.mesh.position.x = this.game.object.position.x;
        this.mesh.position.y = this.game.object.position.y;
        this.mesh.position.z = this.game.object.position.z;

        this.mesh.rotation.x = this.game.object.rotation.x;
        this.mesh.rotation.y = this.game.object.rotation.y;
        this.mesh.rotation.z = this.game.object.rotation.z;
    }

    updateCamera( rY, tY, tZ ) {
            var radian = ( Math.PI / 180 );

            l.scenograph.actors.player.person.camera_distance = l.scenograph.actors.player.person.default_camera_distance + ( l.current_scene.room_depth / 20 );
            if ( l.scenograph.actors.player.person.airSpeed < 0 ) {
                l.scenograph.actors.player.person.camera_distance -= l.scenograph.actors.player.person.airSpeed * 4;
            }

            let xDiff = l.scenograph.actors.player.person.mesh.position.x;
            let zDiff = l.scenograph.actors.player.person.mesh.position.z;

            l.scenograph.cameras.player.position.x = xDiff + l.scenograph.actors.player.person.camera_distance * Math.sin( l.scenograph.actors.player.person.mesh.rotation.y );
            l.scenograph.cameras.player.position.z = zDiff + l.scenograph.actors.player.person.camera_distance * Math.cos( l.scenograph.actors.player.person.mesh.rotation.y );

            // if ( rY != 0 ) {

            //     l.scenograph.cameras.player.rotation.y += rY;
            // }
            // else {
            //     // Check there is y difference and the rotation pad isn't being pressed.
            //     if (
            //         l.scenograph.cameras.player.rotation.y != l.scenograph.actors.player.person.mesh.rotation.y &&
            //         ( l.scenograph.controls.touch && !l.scenograph.controls.touch.controls.rotationPad.mouseDown )
            //     ) {

            //         // Get the difference in y rotation betwen the camera and ship
            //         let yDiff = l.scenograph.actors.player.person.mesh.rotation.y - l.scenograph.cameras.player.rotation.y;

            //         // Check the y difference is larger than 1/100th of a radian
            //         if (
            //             Math.abs( yDiff ) > radian / 100
            //         ) {
            //             // Add 1/60th of the difference in rotation, as FPS currently capped to 60.
            //             l.scenograph.cameras.player.rotation.y += ( l.scenograph.actors.player.person.mesh.rotation.y - l.scenograph.cameras.player.rotation.y ) * 1 / 60;
            //         }
            //         else {
            //             l.scenograph.cameras.player.rotation.y = l.scenograph.actors.player.person.mesh.rotation.y;
            //         }

            //     }

            // }

            // let xDiff2 = tZ * Math.sin( l.scenograph.actors.player.person.mesh.rotation.y ),
            //     zDiff2 = tZ * Math.cos( l.scenograph.actors.player.person.mesh.rotation.y );

            // if ( l.scenograph.actors.player.person.mesh.position.y + tY >= 1 ) {
            //     l.scenograph.cameras.player.position.y += tY;
            // }

            // l.scenograph.cameras.player.position.x += xDiff2;
            // l.scenograph.cameras.player.position.z += zDiff2;

            l.scenograph.cameras.player.updateProjectionMatrix();
        }


    /**
     * Animate hook.
     *
     * This method is called within a delta in the main animation
     * which means it supports "this" references to itself.
     *
     * @method animate
     * @memberof Person
     * @local
     * @note All references within this method should be globally accessible.
    **/
    animate( delta ) {
        if ( l.current_scene.settings.game_controls && l.scenograph.actors.player.mode == 'person' && this.game.object) {

            // Detect keyboard input and pass it to the ship state model.
            this.updateControls();

            // Sync the mesh to game world state.
            this.sync();

            // Update the persons camera
            this.updateCamera(this.game.object.rY, this.game.object.tY, this.game.object.tZ);
            l.scenograph.cameras.player.rotation.y = this.game.object.rotation.y;

        }
    }

}
