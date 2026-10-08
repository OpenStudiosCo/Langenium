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

        // Chase cam yaw, lags behind the ship so turns stay framed.
        this.chaseYaw = 0;

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

    resetFlight() {
        const object = this.vehicle?.mesh?.userData?.object;
        if ( object ) {
            object.airSpeed = 0;
            object.verticalSpeed = 0;
            object.controls.changing = false;
            object.controls.throttleUp = false;
            object.controls.throttleDown = false;
            object.controls.moveUp = false;
            object.controls.moveDown = false;
            object.controls.moveLeft = false;
            object.controls.moveRight = false;

            if ( this.spawn ) {
                object.position.x = this.spawn.position.x;
                object.position.y = this.spawn.position.y;
                object.position.z = this.spawn.position.z;
                object.rotation.x = this.spawn.rotation.x;
                object.rotation.y = this.spawn.rotation.y;
                object.rotation.z = this.spawn.rotation.z;
            }

            this.vehicle.updateMesh();
        }

        if ( this.person && this.person.mesh ) {
            this.person.mesh.visible = false;
        }

        this.chaseYaw = this.vehicle?.mesh?.rotation.y ?? 0;
    }

    async load() {

        // Setup aircraft, used for the intro sequence.
        this.vehicle = new l.scenograph.objects.vehicles.valiant();
        await this.vehicle.load();
        this.vehicle.mesh.name = 'Player Ship';
        this.vehicle.mesh.userData.objectClass = 'player';
        this.vehicle.mesh.userData.targetable = false;
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

        this.setVehicleVisible( false );

        const object = this.vehicle.mesh.userData.object;
        this.spawn = {
            position: { x: object.position.x, y: object.position.y, z: object.position.z },
            rotation: { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
        };

    }

    setVehicleVisible( visible, targetable = visible ) {
        if ( ! this.vehicle || ! this.vehicle.mesh ) {
            return;
        }
        this.vehicle.mesh.visible = visible;
        this.vehicle.mesh.userData.targetable = targetable;
        if ( this.vehicle.trail && this.vehicle.trail.mesh ) {
            this.vehicle.trail.mesh.visible = false;
        }
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

    getChaseCameraPosition( yaw = this.chaseYaw ) {
        return this.vehicle.getChaseCameraPosition( yaw );
    }

    aimChaseCamera() {
        this.vehicle.aimChaseCamera();
    }

    updateCamera( rY, tY, tZ ) {
        const ship = this.vehicle.mesh;
        const cam = l.scenograph.cameras.player;
        const heading = ship.rotation.y;

        this.vehicle.camera_distance = this.vehicle.chaseCameraDistance();

        // Lag placement yaw behind the ship so the camera sits outside the turn.
        let yawError = Math.atan2( Math.sin( heading - this.chaseYaw ), Math.cos( heading - this.chaseYaw ) );
        this.chaseYaw += yawError * ( rY != 0 ? 0.12 : 0.22 );

        yawError = Math.atan2( Math.sin( heading - this.chaseYaw ), Math.cos( heading - this.chaseYaw ) );
        const maxLag = 0.45;
        if ( Math.abs( yawError ) > maxLag ) {
            this.chaseYaw = heading - Math.sign( yawError ) * maxLag;
        }

        const pos = this.vehicle.getChaseCameraPosition( this.chaseYaw );
        cam.position.set( pos.x, pos.y, pos.z );

        const rotationPadDown = l.scenograph.controls.touch
            && l.scenograph.controls.touch.controls.rotationPad.mouseDown;

        if ( ! rotationPadDown ) {
            this.vehicle.aimChaseCamera();
        }

        cam.updateProjectionMatrix();
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

        if ( l.mode !== 'single_player' && l.mode !== 'multi_player' ) {
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
    }

}
