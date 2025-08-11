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

        // Start overlays.
        // @todo: #31 Fix the need for this, only included so that damage calcs can trigger their overlay updates
        l.scenograph.overlays.activate();

        // Set client mode.
        l.mode = 'hangar';

        l.current_scene.objects.platform.mesh.visible = false;
        l.current_scene.objects.hangar.mesh.visible = true;

        l.current_scene.objects.hangar.mesh.position.copy( l.current_scene.objects.platform.mesh.position );
        l.current_scene.objects.hangar.mesh.position.y = 505;

        l.scenograph.actors.player.vehicle.position.x = l.current_scene.objects.platform.mesh.position.x; 
        l.scenograph.actors.player.vehicle.position.z = l.current_scene.objects.platform.mesh.position.z; 
        l.scenograph.actors.player.vehicle.position.y = 500;

        l.scenograph.actors.player.person.position.x = l.current_scene.objects.platform.mesh.position.x; 
        l.scenograph.actors.player.person.position.z = l.current_scene.objects.platform.mesh.position.z - 5; 
        l.scenograph.actors.player.person.position.y = 495;
        
        l.scenograph.cameras.active.position.copy(l.scenograph.actors.player.vehicle.position);
        l.scenograph.cameras.active.translateZ(15);
        l.scenograph.cameras.active.translateY(7.5);
        
        
        if ( l.scenograph.controls.orbit ) {
            l.scenograph.cameras.orbit.updateProjectionMatrix();
            l.scenograph.controls.orbit.update();
            l.scenograph.controls.orbitTarget.x = l.scenograph.actors.player.vehicle.position.x;
            l.scenograph.controls.orbitTarget.y = l.scenograph.actors.player.vehicle.position.y;
            l.scenograph.controls.orbitTarget.z = l.scenograph.actors.player.vehicle.position.z;
        }

        // @todo #31
        // - Implement first person controls
        // - Separate player from aircraft

        l.scenograph.actors.player.setMode('person');

    }

}
