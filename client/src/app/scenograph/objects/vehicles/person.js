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

    constructor(actorInstance) {
        // Set internal game accessor to the game world actor instance.
        this.game = actorInstance;

        // First-person eye sits on the actor — never chase office room_depth.
        this.eye_offset = 0;

        this.mesh = new THREE.Object3D();
    }

    // Internal helper to manage state changes to the person's character model.
    updateControls() {
        if ( l.ui && l.ui.inventory && l.ui.inventory.blocksInput() ) {
            const controls = this.game.actor.controls;
            controls.changing = false;
            controls.forward = false;
            controls.back = false;
            controls.jump = false;
            controls.crouch = false;
            controls.turnLeft = false;
            controls.turnRight = false;
            return;
        }

        let mappings = {
            forward     :  'W',
            back        :  'S',
            jump        :  ' ',
            crouch      :  'shift',
            turnLeft    :  'A',
            turnRight   :  'D',
        }
        let changing = false;
        this.game.actor.controls.touchSteer = false;

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
                            this.game.actor.controls.touchSteer = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveRight ) {
                            this.game.actor.controls.turnRight = true;
                            this.game.actor.controls.touchSteer = true;
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

    updateCamera() {
        const person = l.scenograph.actors.player.person;
        const camera = l.scenograph.cameras.player;
        const heading = person.mesh.rotation.y;
        const pullBack = person.eye_offset;

        // Hangar walk is first-person: eye follows the actor. Office
        // room_depth used to inflate this offset on rotate and shove
        // the view out through the bay wall.
        camera.position.x = person.mesh.position.x + pullBack * Math.sin( heading );
        camera.position.y = person.mesh.position.y;
        camera.position.z = person.mesh.position.z + pullBack * Math.cos( heading );

        camera.rotation.x = 0;
        camera.rotation.z = 0;
        camera.updateProjectionMatrix();
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

            // Update the person's camera
            this.updateCamera();
            l.scenograph.cameras.player.rotation.y = this.game.object.rotation.y;

        }
    }

}
