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

    constructor() {
        console.log( 'Hangar launched' );

        // Start controls.
        l.scenograph.controls.activate();

        // Set client mode.
        l.mode = 'hangar';

        l.scenograph.objects.structures.platform.mesh.visible = false;
        l.scenograph.objects.structures.hangar.mesh.visible = true;

        l.scenograph.objects.structures.hangar.mesh.position.copy( l.scenograph.objects.structures.platform.mesh.position );
        l.scenograph.objects.structures.hangar.mesh.position.y = 505;

        l.scenograph.actors.player.vehicle.mesh.position.x = l.scenograph.objects.structures.platform.mesh.position.x;
        l.scenograph.actors.player.vehicle.mesh.position.z = l.scenograph.objects.structures.platform.mesh.position.z - 2.5;
        l.scenograph.actors.player.vehicle.mesh.position.y = 497.5;

        l.scenograph.actors.player.person.position.x = l.scenograph.objects.structures.platform.mesh.position.x;
        l.scenograph.actors.player.person.position.z = l.scenograph.objects.structures.platform.mesh.position.z + 10;
        l.scenograph.actors.player.person.position.y = 502.5;

        l.scenograph.cameras.active.position.copy(l.scenograph.actors.player.person.position);


        if ( l.scenograph.controls.orbit ) {
            l.scenograph.cameras.orbit.updateProjectionMatrix();
            l.scenograph.controls.orbit.update();
            l.scenograph.controls.orbitTarget.x = l.scenograph.actors.player.vehicle.mesh.position.x;
            l.scenograph.controls.orbitTarget.y = l.scenograph.actors.player.vehicle.mesh.position.y;
            l.scenograph.controls.orbitTarget.z = l.scenograph.actors.player.vehicle.mesh.position.z;
        }

        // @todo #31
        // - Implement first person controls
        // - Separate player from aircraft

        l.scenograph.actors.player.setMode('person');

    }

}
