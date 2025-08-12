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

import PersonBase from '#/game/src/objects/person';

export default class Person extends PersonBase {

    constructor() {
        super();
        this.default_camera_distance = l.scenograph.width < l.scenograph.height ? -5 : -2.5;

        this.camera_distance = 0;

        this.mesh = new THREE.Object3D();


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
                l.scenograph.actors.player.person.controls[ controlName ] = true;
                changing = true;
            }
            else {

                l.scenograph.actors.player.person.controls[ controlName ] = false;

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
                            l.scenograph.actors.player.person.controls.forward = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveBackward ) {
                            l.scenograph.actors.player.person.controls.back = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveUp ) {
                            l.scenograph.actors.player.person.controls.jump = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveDown ) {
                            l.scenograph.actors.player.person.controls.crouch = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveLeft ) {
                            l.scenograph.actors.player.person.controls.turnLeft = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveRight ) {
                            l.scenograph.actors.player.person.controls.turnRight = true;
                        }
                    }

                }
            }
        }
        l.scenograph.actors.player.person.controls.changing = changing;

    }

    // Update the position of the aircraft to spot determined by game logic.
    updateMesh() {
        l.scenograph.actors.player.person.mesh.position.x = l.scenograph.actors.player.person.position.x;
        l.scenograph.actors.player.person.mesh.position.y = l.scenograph.actors.player.person.position.y;
        l.scenograph.actors.player.person.mesh.position.z = l.scenograph.actors.player.person.position.z;

        l.scenograph.actors.player.person.mesh.rotation.x = l.scenograph.actors.player.person.rotation.x;
        l.scenograph.actors.player.person.mesh.rotation.y = l.scenograph.actors.player.person.rotation.y;
        l.scenograph.actors.player.person.mesh.rotation.z = l.scenograph.actors.player.person.rotation.z;
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
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     * 
     * @method animate
     * @memberof Raven
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate( delta ) {
        if ( l.current_scene.settings.game_controls && l.scenograph.actors.player.mode == 'person' ) {
            // Detect keyboard input and pass it to the ship state model.
            l.scenograph.actors.player.person.updateControls();

            // Update the persons state model.
            let [ rY, tY, tZ ] = l.scenograph.actors.player.person.move( l.current_scene.stats.currentTime - l.current_scene.stats.lastTime );


            // Update the persons mesh
            l.scenograph.actors.player.person.updateMesh();

            // Update the persons camera
            l.scenograph.actors.player.person.updateCamera(rY, tY, tZ);

            l.scenograph.cameras.player.rotation.y = l.scenograph.actors.player.person.rotation.y;

        }
    }

   
}
