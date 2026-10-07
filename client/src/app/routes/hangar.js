/**
 * @name            Hangar scene
 * @description     Displays a player hangar
 * @namespace       l.routes.hangar
 * @memberof        l.routes
 * @global
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class hangarRoute {

    // Scenograph instance of a structure that contains a hangar.
    targetStructure = false;

    constructor() {
        console.log( 'Hangar launched' );

        l.scenograph.hangar = this;

        // Set client mode.
        l.mode = 'hangar';

        // Start controls. Move + camera only; climb/weapons stay hidden.
        l.scenograph.controls.activate();
        l.scenograph.controls.setAircraftChrome( false );

        l.routes.setDemoVisible( false );

        this.targetStructure = l.scenograph.objects.structures.platform.instances[0];

        l.scenograph.actors.player = l.scenograph.actors.get('Player Two');
        l.scenograph.actors.player.setMode('person');

        this.loadHangar();
        this.setupPrompt();
        hangarRoute.bindUpdates();

    }

    static bindUpdates() {
        if ( hangarRoute.updatesBound ) {
            return;
        }
        hangarRoute.updatesBound = true;
        l.current_scene.animation_queue.push( () => {
            if ( l.scenograph.hangar ) {
                l.scenograph.hangar.tick();
            }
        } );
    }

    static watchOverworld() {
        if ( ! l.scenograph.hangar ) {
            const watch = Object.create( hangarRoute.prototype );
            watch.departing = false;
            watch.promptDismissed = false;
            watch.promptKeyHeld = false;
            watch.lastShipPos = null;
            watch.cityMeshes = null;
            watch.cityBoxes = null;
            watch.cityRay = new THREE.Raycaster();
            l.scenograph.hangar = watch;
            watch.setupPrompt();
        }
        hangarRoute.bindUpdates();
    }

    loadHangar() {
      if ( ! this.targetStructure ) {
          this.targetStructure = l.scenograph.objects.structures.platform.instances[0];
      }

      l.current_scene.scene.add(l.scenograph.objects.structures.hangar.mesh);

      l.scenograph.objects.structures.hangar.mesh.visible = true;

      l.scenograph.objects.structures.hangar.mesh.position.x = this.targetStructure.userData.config.hangars[0].position.x;
      l.scenograph.objects.structures.hangar.mesh.position.y = this.targetStructure.userData.config.hangars[0].position.y;
      l.scenograph.objects.structures.hangar.mesh.position.z = this.targetStructure.userData.config.hangars[0].position.z;

      const hangarConfig = this.targetStructure.userData.config.hangars[0];
      const ship = l.scenograph.actors.player.vehicle.mesh.userData.object;
      const person = l.scenograph.actors.player.actorInstance.object;

      ship.position.x = hangarConfig.position.x;
      ship.position.z = - 2.5 + hangarConfig.position.z;
      ship.position.y = l.scenograph.objects.structures.hangar.mesh.position.y - 7.5;
      // Face the open bay so depart rolls outward, not into a wall.
      ship.rotation.x = hangarConfig.rotation.x;
      ship.rotation.y = hangarConfig.rotation.y;
      ship.rotation.z = hangarConfig.rotation.z;
      ship.airSpeed = 0;
      ship.verticalSpeed = 0;

      person.position.x = hangarConfig.position.x;
      person.position.z = 10 + hangarConfig.position.z;
      person.position.y = l.scenograph.objects.structures.hangar.mesh.position.y - 2.5;
      person.rotation.x = hangarConfig.rotation.x;
      person.rotation.y = hangarConfig.rotation.y;
      person.rotation.z = hangarConfig.rotation.z;

      l.scenograph.actors.player.vehicle.updateMesh();

      l.scenograph.cameras.active.position.copy(l.scenograph.actors.player.actorInstance.object.position);

      if ( l.scenograph.controls.orbit ) {
          l.scenograph.cameras.orbit.updateProjectionMatrix();
          l.scenograph.controls.orbit.update();
          l.scenograph.controls.orbitTarget.x = l.scenograph.objects.structures.hangar.mesh.position.x;
          l.scenograph.controls.orbitTarget.y = l.scenograph.objects.structures.hangar.mesh.position.y;
          l.scenograph.controls.orbitTarget.z = l.scenograph.objects.structures.hangar.mesh.position.z;
      }
    }

    setupPrompt() {
        this.departing = this.departing || false;
        this.promptDismissed = this.promptDismissed || false;
        this.promptKeyHeld = false;
        this.lastShipPos = this.lastShipPos || null;
        this.cityRay = this.cityRay || new THREE.Raycaster();
        this.prompt = document.querySelector('#depart_prompt');

        if ( !this.prompt ) {
            this.prompt = document.createElement('div');
            this.prompt.id = 'depart_prompt';
            document.querySelector('#game_overlay').appendChild(this.prompt);
            this.prompt.addEventListener('click', event => {
                const action = event.target.closest('button')?.dataset.action;
                if ( action === 'stay' ) {
                    this.promptDismissed = true;
                    this.prompt.classList.remove('visible');
                }
                if ( action === 'depart' ) {
                    this.depart();
                }
                if ( action === 'enter' ) {
                    this.enterHangar();
                }
                event.target.closest('button')?.blur();
            });
        }

        this.promptMode = null;
        this.setPromptMode( l.mode === 'hangar' ? 'depart' : 'enter' );
    }

    setPromptMode( mode ) {
        if ( ! this.prompt || this.promptMode === mode ) {
            return;
        }
        this.promptMode = mode;
        if ( mode === 'enter' ) {
            this.prompt.innerHTML = `
                <p>Lambda City</p>
                <h2>Enter hangar?</h2>
                <p>Land and walk to your aircraft.</p>
                <div>
                    <button type="button" data-action="enter"><kbd>E</kbd> Enter</button>
                    <button type="button" data-action="stay"><kbd>Esc</kbd> Stay</button>
                </div>
            `;
            return;
        }
        this.prompt.innerHTML = `
            <p>Aircraft ready</p>
            <h2>Depart hangar?</h2>
            <p>Board your aircraft and take off.</p>
            <div>
                <button type="button" data-action="depart"><kbd>E</kbd> Depart</button>
                <button type="button" data-action="stay"><kbd>Esc</kbd> Stay</button>
            </div>
        `;
    }

    tick() {
        if ( l.mode === 'hangar' ) {
            this.updateDepartPrompt();
            return;
        }
        if ( l.mode === 'single_player' ) {
            this.preventCityClip();
            this.updateEnterPrompt();
        }
    }

    updateDepartPrompt() {
        if ( this.departing ) {
            this.prompt.classList.remove('visible');
            return;
        }

        this.setPromptMode('depart');

        const person = l.scenograph.actors.player.actorInstance.object.position;
        const ship = l.scenograph.actors.player.vehicle.mesh.userData.object.position;
        const near = Math.hypot( person.x - ship.x, person.z - ship.z ) < 6;

        if ( !near ) {
            this.promptDismissed = false;
        }

        const show = near && !this.promptDismissed;
        this.prompt.classList.toggle('visible', show);

        if ( !show ) {
            this.promptKeyHeld = false;
            return;
        }

        const ePressed = l.scenograph.controls.keyboard.pressed('E');
        const escPressed = l.scenograph.controls.keyboard.pressed('escape');
        if ( ePressed && !this.promptKeyHeld ) {
            this.depart();
        }
        if ( escPressed && !this.promptKeyHeld ) {
            this.promptDismissed = true;
            this.prompt.classList.remove('visible');
        }
        this.promptKeyHeld = ePressed || escPressed;
    }

    updateEnterPrompt() {
        const player = l.scenograph.actors.player;
        if ( ! player || player.mode !== 'vehicle' || this.departing ) {
            this.prompt.classList.remove('visible');
            return;
        }

        this.setPromptMode('enter');

        const ship = player.vehicle.mesh.userData.object.position;
        const near = this.distanceToCity( ship ) <= 50;

        if ( !near ) {
            this.promptDismissed = false;
        }

        const show = near && !this.promptDismissed;
        this.prompt.classList.toggle('visible', show);

        if ( !show ) {
            this.promptKeyHeld = false;
            return;
        }

        const ePressed = l.scenograph.controls.keyboard.pressed('E');
        const escPressed = l.scenograph.controls.keyboard.pressed('escape');
        if ( ePressed && !this.promptKeyHeld ) {
            this.enterHangar();
        }
        if ( escPressed && !this.promptKeyHeld ) {
            this.promptDismissed = true;
            this.prompt.classList.remove('visible');
        }
        this.promptKeyHeld = ePressed || escPressed;
    }

    getCityMeshes() {
        if ( this.cityMeshes ) {
            return this.cityMeshes;
        }
        const meshes = [];
        const instance = l.scenograph.objects.structures.platform.instances[0];
        if ( instance ) {
            meshes.push( instance );
        }
        if ( l.current_scene.objects.platform && l.current_scene.objects.platform.mesh ) {
            meshes.push( l.current_scene.objects.platform.mesh );
        }
        this.cityMeshes = meshes;
        this.cityBoxes = meshes.map( mesh => {
            mesh.updateWorldMatrix( true, true );
            return new THREE.Box3().setFromObject( mesh );
        } );
        return this.cityMeshes;
    }

    distanceToCity( pos ) {
        const meshes = this.getCityMeshes();
        if ( meshes.length === 0 ) {
            return Infinity;
        }
        const point = new THREE.Vector3( pos.x, pos.y, pos.z );
        let dist = Infinity;
        this.cityBoxes.forEach( box => {
            if ( box.containsPoint( point ) ) {
                dist = 0;
                return;
            }
            dist = Math.min( dist, point.distanceTo( box.clampPoint( point, new THREE.Vector3() ) ) );
        } );
        return dist;
    }

    preventCityClip() {
        const player = l.scenograph.actors.player;
        if ( ! player || player.mode !== 'vehicle' ) {
            return;
        }

        const ship = player.vehicle.mesh.userData.object.position;
        const meshes = this.getCityMeshes();
        if ( meshes.length === 0 ) {
            return;
        }

        if ( ! this.lastShipPos ) {
            this.lastShipPos = { x: ship.x, y: ship.y, z: ship.z };
            return;
        }

        const origin = new THREE.Vector3( this.lastShipPos.x, this.lastShipPos.y, this.lastShipPos.z );
        const next = new THREE.Vector3( ship.x, ship.y, ship.z );
        const travel = next.clone().sub( origin );
        const distance = travel.length();

        if ( distance > 0.001 ) {
            this.cityRay.set( origin, travel.normalize() );
            this.cityRay.far = distance + 8;
            const hits = this.cityRay.intersectObjects( meshes, true );
            if ( hits.length > 0 && hits[0].distance <= distance + 8 ) {
                ship.x = this.lastShipPos.x;
                ship.y = this.lastShipPos.y;
                ship.z = this.lastShipPos.z;
                player.vehicle.mesh.userData.object.airSpeed = 0;
                player.vehicle.mesh.userData.object.verticalSpeed = 0;
                player.vehicle.updateMesh();
                return;
            }
        }

        this.lastShipPos = { x: ship.x, y: ship.y, z: ship.z };
    }

    /**
     * Keep the chase cam just behind the ship so it stays inside the bay.
     */
    followDepartCamera( player ) {
        const mesh = player.vehicle.mesh;
        const back = 8;
        l.scenograph.cameras.player.position.x = mesh.position.x + back * Math.sin( mesh.rotation.y );
        l.scenograph.cameras.player.position.z = mesh.position.z + back * Math.cos( mesh.rotation.y );
        l.scenograph.cameras.player.rotation.x = 0;
        l.scenograph.cameras.player.rotation.y = mesh.rotation.y;
        l.scenograph.cameras.player.updateProjectionMatrix();
    }

    /**
     * Board the ship, roll it forward, then hand off to overworld flight.
     */
    depart() {
        if ( this.departing ) {
            return;
        }
        this.departing = true;
        this.prompt.classList.remove('visible');

        const player = l.scenograph.actors.player;
        const ship = player.vehicle.mesh.userData.object;

        if ( player.person && player.person.mesh ) {
            player.person.mesh.visible = false;
        }

        l.current_scene.settings.game_controls = false;
        player.vehicle.updateMesh();
        this.followDepartCamera( player );

        const heading = ship.rotation.y;
        l.current_scene.tweens.shipDepart = new TWEEN.Tween( ship.position )
            .to( {
                x: ship.position.x - 20 * Math.sin( heading ),
                z: ship.position.z - 20 * Math.cos( heading )
            }, 2000 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .onUpdate( () => {
                player.vehicle.updateMesh();
                this.followDepartCamera( player );
            } )
            .onComplete( () => {
                this.unloadHangar();
                this.handoffCamera( player );
            } )
            .start();
    }

    /**
     * Dolly from the close hangar follow into the overworld chase cam.
     */
    handoffCamera( player ) {
        const mesh = player.vehicle.mesh;
        const cam = l.scenograph.cameras.player;
        const heading = mesh.rotation.y;
        const flightBack = player.vehicle.default_camera_distance + ( l.current_scene.room_depth / 2 );
        const coords = {
            x: cam.position.x,
            y: cam.position.y,
            z: cam.position.z
        };

        l.current_scene.tweens.cameraHandoff = new TWEEN.Tween( coords )
            .to( {
                x: mesh.position.x + flightBack * Math.sin( heading ),
                z: mesh.position.z + flightBack * Math.cos( heading )
            }, 1400 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .onUpdate( () => {
                cam.position.x = coords.x;
                cam.position.z = coords.z;
                cam.rotation.x = 0;
                cam.rotation.y = heading;
                cam.updateProjectionMatrix();
            } )
            .onComplete( () => {
                this.enterOverworld();
            } )
            .start();
    }

    unloadHangar() {
        const hangar = l.scenograph.objects.structures.hangar?.mesh;
        if ( ! hangar ) {
            return;
        }
        hangar.visible = false;
        l.current_scene.scene.remove( hangar );
    }

    /**
     * Stop hangar/overworld session work when returning to the main menu.
     */
    cancelSession() {
        if ( l.current_scene.tweens.shipDepart ) {
            l.current_scene.tweens.shipDepart.stop();
        }
        if ( l.current_scene.tweens.cameraHandoff ) {
            l.current_scene.tweens.cameraHandoff.stop();
        }

        this.departing = false;
        this.promptDismissed = false;
        this.lastShipPos = null;

        if ( this.prompt ) {
            this.prompt.classList.remove('visible');
        }

        this.unloadHangar();
    }

    /**
     * Same overworld handoff as P1: vehicle mode, HUD overlays, flight controls.
     */
    enterOverworld() {
        if ( l.current_scene.objects.demoShip ) {
            l.current_scene.objects.demoShip.ready = true;
        }
        l.mode = 'single_player';
        l.scenograph.actors.player.setMode('vehicle');
        l.scenograph.actors.player.chaseYaw = l.scenograph.actors.player.vehicle.mesh.rotation.y;
        l.current_scene.settings.game_controls = true;
        this.departing = false;
        this.promptDismissed = true;
        this.lastShipPos = null;
        this.setPromptMode('enter');
        l.scenograph.overlays.activate();
        l.scenograph.controls.setAircraftChrome( true );
        hangarRoute.watchOverworld();
    }

    /**
     * Dock at Lambda City and walk the hangar as Player Two.
     */
    enterHangar() {
        if ( l.mode === 'hangar' ) {
            return;
        }
        this.prompt.classList.remove('visible');
        this.promptDismissed = false;
        this.departing = false;

        if ( l.scenograph.overlays.hud ) {
            l.scenograph.overlays.deactivate();
        }

        l.mode = 'hangar';
        l.scenograph.actors.player = l.scenograph.actors.get('Player Two');
        l.scenograph.actors.player.setMode('person');
        if ( l.scenograph.actors.player.person && l.scenograph.actors.player.person.mesh ) {
            l.scenograph.actors.player.person.mesh.visible = true;
        }
        this.targetStructure = l.scenograph.objects.structures.platform.instances[0];
        this.loadHangar();
        this.setPromptMode('depart');
        l.scenograph.controls.setAircraftChrome( false );
    }

}
