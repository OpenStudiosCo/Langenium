/**
 * @name            Hangar scene
 * @description     Displays a player hangar
 * @namespace       l.routes.hangar
 * @memberof        l.routes
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class hangarRoute {

    // Scenograph instance of a structure that contains a hangar.
    targetStructure = false;

    constructor() {
        console.log( 'Hangar launched' );

        // Start controls.
        l.scenograph.controls.activate();

        // Set client mode.
        l.mode = 'hangar';

        this.targetStructure = l.scenograph.objects.structures.platform.instances[0];

        l.scenograph.actors.player = l.scenograph.actors.get('Player Two');
        l.scenograph.actors.player.setMode('person');

        this.loadHangar();
        this.setupDepartPrompt();

    }

    loadHangar() {
      l.current_scene.scene.add(l.scenograph.objects.structures.hangar.mesh);

      l.scenograph.objects.structures.hangar.mesh.visible = true;

      l.scenograph.objects.structures.hangar.mesh.position.x = this.targetStructure.userData.config.hangars[0].position.x;
      l.scenograph.objects.structures.hangar.mesh.position.y = this.targetStructure.userData.config.hangars[0].position.y;
      l.scenograph.objects.structures.hangar.mesh.position.z = this.targetStructure.userData.config.hangars[0].position.z;

      l.scenograph.actors.player.vehicle.mesh.userData.object.position.x =  this.targetStructure.userData.config.hangars[0].position.x;
      l.scenograph.actors.player.vehicle.mesh.userData.object.position.z = - 2.5 + this.targetStructure.userData.config.hangars[0].position.z;
      l.scenograph.actors.player.vehicle.mesh.userData.object.position.y = l.scenograph.objects.structures.hangar.mesh.position.y - 7.5;

      l.scenograph.actors.player.actorInstance.object.position.x = this.targetStructure.userData.config.hangars[0].position.x;
      l.scenograph.actors.player.actorInstance.object.position.z = 10 + this.targetStructure.userData.config.hangars[0].position.z;
      l.scenograph.actors.player.actorInstance.object.position.y = l.scenograph.objects.structures.hangar.mesh.position.y - 2.5;

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

    setupDepartPrompt() {
        this.departing = false;
        this.promptDismissed = false;
        this.promptKeyHeld = false;
        this.prompt = document.querySelector('#depart_prompt');

        if ( !this.prompt ) {
            this.prompt = document.createElement('div');
            this.prompt.id = 'depart_prompt';
            this.prompt.innerHTML = `
                <p>Aircraft ready</p>
                <h2>Depart hangar?</h2>
                <p>Board your aircraft and take off.</p>
                <div>
                    <button type="button" data-action="depart"><kbd>E</kbd> Depart</button>
                    <button type="button" data-action="stay"><kbd>Esc</kbd> Stay</button>
                </div>
            `;
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
                event.target.closest('button')?.blur();
            });
            l.current_scene.animation_queue.push( () => this.updateDepartPrompt() );
        }
    }

    updateDepartPrompt() {
        if ( l.mode !== 'hangar' || this.departing ) {
            this.prompt.classList.remove('visible');
            return;
        }

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
                this.enterOverworld();
            } )
            .start();
    }

    unloadHangar() {
        const hangar = l.scenograph.objects.structures.hangar.mesh;
        hangar.visible = false;
        l.current_scene.scene.remove( hangar );
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
        l.current_scene.settings.game_controls = true;
        l.scenograph.overlays.activate();
    }

}
