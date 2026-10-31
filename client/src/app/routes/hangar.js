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

        const player = l.scenograph.actors.player || l.scenograph.actors.get( 'Player' );
        l.scenograph.actors.player = player;
        player.setMode( 'person' );

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

      const hangars = this.targetStructure.userData.config.hangars;
      const name = l.scenograph.actors.player.actorInstance.config.hangar.hangarName;
      const hangarConfig = hangars.find( ( hangar ) => hangar.name === name );
      const hangarMesh = l.scenograph.objects.structures.hangar.mesh;
      hangarMesh.visible = true;
      hangarMesh.position.set( hangarConfig.position.x, hangarConfig.position.y, hangarConfig.position.z );
      hangarMesh.rotation.set( hangarConfig.rotation.x, hangarConfig.rotation.y, hangarConfig.rotation.z );

      // Local -Z is out the bay door.
      const place = ( object, x, y, z ) => {
          const spot = new THREE.Vector3( x, y, z ).applyEuler( hangarMesh.rotation ).add( hangarMesh.position );
          object.position.x = spot.x;
          object.position.y = spot.y;
          object.position.z = spot.z;
          object.rotation.x = hangarMesh.rotation.x;
          object.rotation.y = hangarMesh.rotation.y;
          object.rotation.z = hangarMesh.rotation.z;
      };

      const ship = l.scenograph.actors.player.vehicle.mesh.userData.object;
      place( ship, 0, -7.5, -2.5 );
      ship.airSpeed = 0;
      ship.verticalSpeed = 0;

      place( l.scenograph.actors.player.actorInstance.object, 0, -2.5, 10 );

      // Terminal: design coords are pre-scale (same space as hangar components).
      const terminalConfig = l.scenograph.objects.structures.hangar.objectClass.design.components
          .find( ( component ) => component.name === 'Terminal' );
      const terminalMesh = l.scenograph.objects.structures.terminal.mesh;
      const scale = hangarMesh.scale.x;
      place(
          terminalMesh,
          terminalConfig.position.x * scale,
          terminalConfig.position.y * scale,
          terminalConfig.position.z * scale
      );
      terminalMesh.rotation.x += terminalConfig.rotation.x;
      terminalMesh.rotation.y += terminalConfig.rotation.y;
      terminalMesh.rotation.z += terminalConfig.rotation.z;
      terminalMesh.visible = true;
      l.current_scene.scene.add( terminalMesh );

      l.scenograph.actors.player.vehicle.updateMesh();
      l.scenograph.actors.player.setVehicleVisible( true, false );

      const actor = l.scenograph.actors.player.actorInstance.object;
      const camera = l.scenograph.cameras.player;
      camera.position.copy( actor.position );
      camera.rotation.set( 0, actor.rotation.y, 0 );
      if ( l.scenograph.cameras.active !== camera ) {
          l.scenograph.cameras.active.position.copy( camera.position );
          l.scenograph.cameras.active.rotation.copy( camera.rotation );
      }

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
        this.promptOpen = false;
        this.promptMode = null;
        this.lastShipPos = this.lastShipPos || null;
        this.cityRay = this.cityRay || new THREE.Raycaster();
    }

    promptLine( mode ) {
        const hangar = this;
        const stay = () => {
            hangar.promptDismissed = true;
            hangar.promptOpen = false;
        };

        if ( mode === 'enter' ) {
            return {
                owner: 'hangar',
                modal: false,
                close: false,
                speaker: 'Lambda City',
                text: 'Enter hangar?',
                onDismiss: stay,
                actions: [
                    {
                        key: 'E',
                        label: 'Enter',
                        run: () => {
                            hangar.promptOpen = false;
                            hangar.enterHangar();
                        }
                    },
                    { key: 'Esc', label: 'Cancel', run: stay }
                ]
            };
        }

        if ( mode === 'terminal' ) {
            return {
                owner: 'hangar',
                modal: false,
                close: false,
                speaker: 'Hangar computer',
                text: 'Access hangar storage?',
                onDismiss: stay,
                actions: [
                    {
                        key: 'E',
                        label: 'Open',
                        run: () => {
                            hangar.promptOpen = false;
                            hangar.openTerminalStorage();
                        }
                    },
                    { key: 'Esc', label: 'Cancel', run: stay }
                ]
            };
        }

        return {
            owner: 'hangar',
            modal: false,
            close: false,
            speaker: 'Aircraft ready',
            text: 'Depart hangar?',
            onDismiss: stay,
            actions: [
                {
                    key: 'E',
                    label: 'Depart',
                    run: () => {
                        hangar.promptOpen = false;
                        hangar.depart();
                    }
                },
                { key: 'Esc', label: 'Cancel', run: stay }
            ]
        };
    }

    /**
     * Storage access belongs to the terminal object, not the hangar route.
     */
    openTerminalStorage() {
        const terminal = l.scenograph.objects.structures.terminal;
        if ( terminal && typeof terminal.openStorage === 'function' ) {
            terminal.openStorage();
        }
    }

    syncPrompt( show, mode ) {
        if ( ! l.ui || ! l.ui.dialog ) {
            return;
        }

        if ( ! show ) {
            this.hidePrompt();
            return;
        }

        if ( this.promptOpen && this.promptMode === mode ) {
            return;
        }

        if ( l.ui.dialog.isShowing() && l.ui.dialog.owner !== 'hangar' ) {
            return;
        }

        this.promptOpen = true;
        this.promptMode = mode;
        l.ui.dialog.show( this.promptLine( mode ) );
    }

    hidePrompt() {
        if ( ! this.promptOpen ) {
            return;
        }

        this.promptOpen = false;

        if ( l.ui && l.ui.dialog && l.ui.dialog.owner === 'hangar' ) {
            l.ui.dialog.hide();
        }
    }

    tick() {
        if ( l.mode === 'hangar' ) {
            this.updateHangarPrompts();
            return;
        }
        if ( l.mode === 'single_player' ) {
            this.preventCityClip();
            this.updateEnterPrompt();
        }
    }

    personNear( target, radius ) {
        if ( ! target || target.x === undefined ) {
            return false;
        }

        const person = l.scenograph.actors.player.actorInstance.object.position;
        return Math.hypot( person.x - target.x, person.z - target.z ) < radius;
    }

    updateHangarPrompts() {
        if ( this.departing || ( l.ui && l.ui.inventory && l.ui.inventory.isOpen() ) ) {
            this.hidePrompt();
            return;
        }

        const ship = l.scenograph.actors.player.vehicle.mesh.userData.object.position;
        const terminal = l.scenograph.objects.structures.terminal
            && l.scenograph.objects.structures.terminal.mesh
            && l.scenograph.objects.structures.terminal.mesh.position;
        const nearTerminal = this.personNear( terminal, 3.5 );
        const nearShip = this.personNear( ship, 6 );

        if ( ! nearTerminal && ! nearShip ) {
            this.promptDismissed = false;
            this.hidePrompt();
            this.promptKeyHeld = false;
            return;
        }

        // Prefer the terminal when both are in range.
        const mode = nearTerminal ? 'terminal' : 'depart';
        const show = ! this.promptDismissed;
        this.syncPrompt( show, mode );

        if ( ! show || ! this.promptOpen ) {
            this.promptKeyHeld = false;
            return;
        }

        const ePressed = l.scenograph.controls.keyboard.pressed( 'E' );
        const escPressed = l.scenograph.controls.keyboard.pressed( 'escape' );

        if ( ePressed && ! this.promptKeyHeld ) {
            if ( mode === 'terminal' ) {
                this.openTerminalStorage();
            }
            else {
                this.depart();
            }
            this.hidePrompt();
        }
        if ( escPressed && ! this.promptKeyHeld ) {
            this.promptDismissed = true;
            this.hidePrompt();
        }
        this.promptKeyHeld = ePressed || escPressed;
    }

    updateEnterPrompt() {
        const player = l.scenograph.actors.player;
        if ( ! player || player.mode !== 'vehicle' || this.departing ) {
            this.hidePrompt();
            return;
        }

        const ship = player.vehicle.mesh.userData.object.position;
        const near = this.distanceToCity( ship ) <= 50;

        if ( !near ) {
            this.promptDismissed = false;
        }

        const show = near && !this.promptDismissed;
        this.syncPrompt( show, 'enter' );

        if ( !show || !this.promptOpen ) {
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
            this.hidePrompt();
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
     * How far to roll so the ship clears this hangar, then sits 100m outside it.
     */
    departDistance( shipMesh ) {
        const clearance = 100;
        const hangar = l.scenograph.objects.structures.hangar?.mesh;
        if ( ! hangar ) {
            return clearance;
        }

        const heading = shipMesh.rotation.y;
        const forward = new THREE.Vector3( -Math.sin( heading ), 0, -Math.cos( heading ) );
        hangar.updateWorldMatrix( true, true );
        const box = new THREE.Box3().setFromObject( hangar );
        const origin = shipMesh.position;
        let ahead = 0;
        const corner = new THREE.Vector3();
        for ( const x of [ box.min.x, box.max.x ] ) {
            for ( const y of [ box.min.y, box.max.y ] ) {
                for ( const z of [ box.min.z, box.max.z ] ) {
                    const along = corner.set( x, y, z ).sub( origin ).dot( forward );
                    if ( along > ahead ) {
                        ahead = along;
                    }
                }
            }
        }
        return ahead + clearance;
    }

    /**
     * Board the ship, roll it clear of the bay, then hand off to overworld flight.
     */
    depart() {
        if ( this.departing ) {
            return;
        }
        this.departing = true;
        this.hidePrompt();
        if ( l.ui && l.ui.inventory ) {
            l.ui.inventory.hidePersonButton();
            if ( l.ui.inventory.isOpen() ) {
                l.ui.inventory.hide();
            }
        }

        const player = l.scenograph.actors.player;
        const ship = player.vehicle.mesh.userData.object;

        if ( player.person && player.person.mesh ) {
            player.person.mesh.visible = false;
        }

        l.current_scene.settings.game_controls = false;
        player.vehicle.updateMesh();
        this.followDepartCamera( player );

        const heading = ship.rotation.y;
        const distance = this.departDistance( player.vehicle.mesh );
        l.current_scene.tweens.shipDepart = new TWEEN.Tween( ship.position )
            .to( {
                x: ship.position.x - distance * Math.sin( heading ),
                z: ship.position.z - distance * Math.cos( heading )
            }, Math.min( 5000, Math.max( 2500, distance * 30 ) ) )
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
        const cam = l.scenograph.cameras.player;
        player.chaseYaw = player.vehicle.mesh.rotation.y;
        const target = player.getChaseCameraPosition();
        const coords = {
            x: cam.position.x,
            y: cam.position.y,
            z: cam.position.z
        };

        l.current_scene.tweens.cameraHandoff = new TWEEN.Tween( coords )
            .to( target, 1400 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .onUpdate( () => {
                cam.position.set( coords.x, coords.y, coords.z );
                player.aimChaseCamera();
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

        const terminal = l.scenograph.objects.structures.terminal?.mesh;
        if ( terminal ) {
            terminal.visible = false;
            l.current_scene.scene.remove( terminal );
        }
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

        this.hidePrompt();
        if ( l.ui && l.ui.inventory ) {
            l.ui.inventory.hidePersonButton();
            if ( l.ui.inventory.isOpen() ) {
                l.ui.inventory.hide();
            }
        }

        this.unloadHangar();
    }

    /**
     * Vehicle mode, HUD overlays, flight controls.
     */
    enterOverworld() {
        if ( l.current_scene.objects.demoTour ) {
            l.current_scene.objects.demoTour.ready = true;
        }
        l.mode = 'single_player';
        l.scenograph.actors.player.setVehicleVisible( true );
        l.scenograph.actors.player.setMode('vehicle');
        l.scenograph.actors.player.chaseYaw = l.scenograph.actors.player.vehicle.mesh.rotation.y;
        l.current_scene.settings.game_controls = true;
        this.departing = false;
        this.promptDismissed = true;
        this.promptKeyHeld = false;
        this.lastShipPos = null;
        this.promptMode = 'enter';
        l.scenograph.overlays.activate();
        l.scenograph.controls.setAircraftChrome( true );
        hangarRoute.watchOverworld();
        if ( l.saves ) {
            l.saves.saveNow( 'transition' );
        }
    }

    /**
     * Dock at Lambda City and walk the hangar.
     */
    enterHangar() {
        if ( l.mode === 'hangar' ) {
            return;
        }
        this.hidePrompt();
        this.promptDismissed = false;
        this.departing = false;

        if ( l.current_scene.tweens.shipDepart ) {
            l.current_scene.tweens.shipDepart.stop();
        }
        if ( l.current_scene.tweens.cameraHandoff ) {
            l.current_scene.tweens.cameraHandoff.stop();
        }

        if ( l.scenograph.overlays.hud ) {
            l.scenograph.overlays.deactivate();
        }

        l.mode = 'hangar';
        for ( const actor of l.scenograph.actors.getAll() ) {
            if ( typeof actor.setVehicleVisible === 'function' ) {
                actor.setVehicleVisible( false );
            }
        }
        const player = l.scenograph.actors.player || l.scenograph.actors.get( 'Player' );
        l.scenograph.actors.player = player;
        player.setMode( 'person' );
        if ( player.person && player.person.mesh ) {
            player.person.mesh.visible = true;
        }
        this.targetStructure = l.scenograph.objects.structures.platform.instances[0];
        this.loadHangar();
        this.promptMode = 'depart';
        l.scenograph.controls.setAircraftChrome( false );
        if ( l.saves ) {
            l.saves.saveNow( 'transition' );
        }
    }

}
