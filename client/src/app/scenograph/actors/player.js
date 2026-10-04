/**
 * @name            Player
 * @description     Provides an interface to the player actor in the game.
 * @memberof        l.scenograph.actors
 * @global
 */

/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import ActorPlayer from '#/game/src/actors/player';

export default class Player {

    // Whether the player is in their vehicle or not.
    mode;

    ready;

    // Character model.
    person;

    // Vehicle model.
    vehicle;

    constructor( actorInstance ) {

        this.actorInstance = actorInstance;

        this.ready = false;

        this.person = false;

        this.vehicle = false;

        this.setMode();
    }

    setMode( mode = 'vehicle' ) {
        if ( mode === 'vehicle' ) {
            this.mode = 'vehicle';
        }
        else {
            this.mode = 'person';
        }
    }

    async load() {

        // Setup aircraft, used for the intro sequence.
        this.vehicle = new l.scenograph.objects.vehicles.valiant();
        await this.vehicle.load();
        this.vehicle.mesh.name = 'Player Ship';
        this.vehicle.mesh.userData.objectClass = 'player';
        this.vehicle.mesh.userData.actor = new ActorPlayer( this.vehicle.mesh, l.current_scene.scene );
        l.scenograph.entityManager.add( this.vehicle.mesh.userData.actor.entity );
        l.current_scene.scene.add(
          this.vehicle.mesh
        );
        l.current_scene.animation_queue.push(
            delta => this.animate(delta)
        );
        l.current_scene.animation_queue.push(
            delta => this.vehicle.animate(delta)
        );

        // Setup person, used for the hangar scene.
        this.person = new l.scenograph.objects.vehicles.person(this.actorInstance);
        l.current_scene.scene.add(
            this.person.mesh
        );
        l.current_scene.animation_queue.push(
            delta => this.person.animate(delta)
        );

    }

    // Internal helper to manage state changes of aircraft controls.
    updateControls() {
        let mappings = {
            throttleUp  :  'W',
            throttleDown:  'S',
            moveUp      :  ' ',
            moveDown    :  'shift',
            moveLeft    :  'A',
            moveRight   :  'D',
        }
        let changing = false;
        for ( const [ controlName, keyMapping ] of Object.entries( mappings ) ) {
            if ( l.scenograph.controls.keyboard.pressed( keyMapping ) ) {
                this.vehicle.mesh.userData.object.controls[ controlName ] = true;
                changing = true;
            }
            else {

                this.vehicle.mesh.userData.object.controls[ controlName ] = false;

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
                        if ( l.scenograph.controls.touch.controls.moveUp ) {
                            this.vehicle.mesh.userData.object.controls.moveUp = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveDown ) {
                            this.vehicle.mesh.userData.object.controls.moveDown = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveForward ) {
                            this.vehicle.mesh.userData.object.controls.throttleUp = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveBackward ) {
                            this.vehicle.mesh.userData.object.controls.throttleDown = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveLeft ) {
                            this.vehicle.mesh.userData.object.controls.moveLeft = true;
                        }
                        if ( l.scenograph.controls.touch.controls.moveRight ) {
                            this.vehicle.mesh.userData.object.controls.moveRight = true;
                        }
                    }

                }
            }
        }
        this.vehicle.mesh.userData.object.controls.changing = changing;

    }

    updateCamera( rY, tY, tZ ) {
        var radian = ( Math.PI / 180 );
        let vehicle = this.vehicle;

        vehicle.camera_distance = vehicle.default_camera_distance + ( l.current_scene.room_depth / 2 );
        if ( vehicle.mesh.userData.object.airSpeed < 0 ) {
            vehicle.camera_distance -= vehicle.mesh.userData.object.airSpeed * 4;
        }

        let xDiff = vehicle.mesh.position.x;
        let zDiff = vehicle.mesh.position.z;

        l.scenograph.cameras.player.position.x = xDiff + vehicle.camera_distance * Math.sin( vehicle.mesh.rotation.y );
        l.scenograph.cameras.player.position.z = zDiff + vehicle.camera_distance * Math.cos( vehicle.mesh.rotation.y );

        if ( rY != 0 && Math.abs(l.scenograph.cameras.player.rotation.y) < .3925 ) {
            l.scenograph.cameras.player.rotation.y += rY;
        }
        else {
            // Check there is y difference and the rotation pad isn't being pressed.
            if (
                l.scenograph.cameras.player.rotation.y != vehicle.mesh.rotation.y &&
                ( l.scenograph.controls.touch && !l.scenograph.controls.touch.controls.rotationPad.mouseDown )
            ) {

                // Get the difference in y rotation betwen the camera and ship
                let yDiff = vehicle.mesh.rotation.y - l.scenograph.cameras.player.rotation.y;

                // Check the y difference is larger than 1/100th of a radian
                if (
                    Math.abs( yDiff ) > radian / 100
                ) {
                    // Add 1/60th of the difference in rotation, as FPS currently capped to 60.
                    l.scenograph.cameras.player.rotation.y += ( vehicle.mesh.rotation.y - l.scenograph.cameras.player.rotation.y ) * 1 / 60;
                }
                else {
                    l.scenograph.cameras.player.rotation.y = vehicle.mesh.rotation.y;
                }

            }

        }

        let xDiff2 = tZ * Math.sin( vehicle.mesh.rotation.y ),
            zDiff2 = tZ * Math.cos( vehicle.mesh.rotation.y );

        if ( vehicle.mesh.position.y + tY >= 1 ) {
            l.scenograph.cameras.player.position.y += tY;
        }

        l.scenograph.cameras.player.position.x += xDiff2;
        l.scenograph.cameras.player.position.z += zDiff2;

        if (
            vehicle.mesh.userData.object.controls.moveDown
            ||
            vehicle.mesh.userData.object.controls.moveUp
        ) {
            let elevationChange = vehicle.mesh.userData.object.controls.moveDown ? -1 : 1;
            if ( Math.abs( l.scenograph.cameras.player.rotation.x ) < 1 / 8 ) {
                l.scenograph.cameras.player.rotation.x += elevationChange * radian / 10;
            }
        }
        else {
            if ( l.scenograph.controls.touch && !l.scenograph.controls.touch.controls.rotationPad.mouseDown )
                l.scenograph.cameras.player.rotation.x *= .9;
        }

        l.scenograph.cameras.player.updateProjectionMatrix();
    }

    /**
     * Animate hook.
     *
     * Pilots this actor's vehicle when it is the active player.
     *
     * @method animate
     * @memberof Player
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate( delta ) {

        if ( ! this.vehicle || ! this.vehicle.mesh.userData.object ) {
            return;
        }

        if ( ! l.current_scene.objects.demoShip || ! l.current_scene.objects.demoShip.ready ) {
            return;
        }

        if ( l.scenograph.actors.player !== this || this.mode != 'vehicle' ) {
            return;
        }

        if ( l.current_scene.settings.game_controls ) {

            this.updateControls();

            if ( l.scenograph.modes.multiplayer.connected ) {
                l.scenograph.modes.multiplayer.socket.emit( 'input', this.vehicle.mesh.userData.object.controls );
            }

            this.vehicle.mesh.userData.actor.animate( delta );

        }

        let [ rY, tY, tZ ] = this.vehicle.mesh.userData.object.move( l.current_scene.stats.currentTime - l.current_scene.stats.lastTime );

        this.vehicle.updateMesh();

        this.updateCamera( rY, tY, tZ );

        this.vehicle.animateTrail( rY );
    }

}
