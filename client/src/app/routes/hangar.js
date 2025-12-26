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

    }

    loadHangar() {
      l.current_scene.scene.add(l.scenograph.objects.structures.hangar.mesh);
      this.targetStructure.visible = false;
      l.scenograph.objects.structures.hangar.mesh.visible = true;
      l.scenograph.objects.structures.hangar.mesh.position.copy( this.targetStructure.position );
      l.scenograph.objects.structures.hangar.mesh.position.y = this.targetStructure.userData.config.hangars[0].position.y;

      l.scenograph.actors.player.vehicle.mesh.userData.object.position.x = this.targetStructure.position.x;
      l.scenograph.actors.player.vehicle.mesh.userData.object.position.z = this.targetStructure.position.z - 2.5;
      l.scenograph.actors.player.vehicle.mesh.userData.object.position.y = l.scenograph.objects.structures.hangar.mesh.position.y - 7.5;

      l.scenograph.actors.player.actorInstance.object.position.x = this.targetStructure.position.x;
      l.scenograph.actors.player.actorInstance.object.position.z = this.targetStructure.position.z + 10;
      l.scenograph.actors.player.actorInstance.object.position.y = l.scenograph.objects.structures.hangar.mesh.position.y - 2.5
      ;

      l.scenograph.cameras.active.position.copy(l.scenograph.actors.player.actorInstance.object.position);

      if ( l.scenograph.controls.orbit ) {
          l.scenograph.cameras.orbit.updateProjectionMatrix();
          l.scenograph.controls.orbit.update();
          l.scenograph.controls.orbitTarget.x = l.scenograph.objects.structures.hangar.mesh.position.x;
          l.scenograph.controls.orbitTarget.y = l.scenograph.objects.structures.hangar.mesh.position.y;
          l.scenograph.controls.orbitTarget.z = l.scenograph.objects.structures.hangar.mesh.position.z;
      }
    }

}
