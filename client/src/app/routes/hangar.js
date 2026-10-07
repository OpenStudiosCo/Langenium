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
                event.target.closest('button')?.blur();
            });
            l.current_scene.animation_queue.push( () => this.updateDepartPrompt() );
        }
    }

    updateDepartPrompt() {
        if ( l.mode !== 'hangar' ) {
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
        if ( escPressed && !this.promptKeyHeld ) {
            this.promptDismissed = true;
            this.prompt.classList.remove('visible');
        }
        this.promptKeyHeld = ePressed || escPressed;
    }

}
