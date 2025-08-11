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
        
        l.current_scene.objects.player.position.x = l.current_scene.objects.platform.mesh.position.x; 
        l.current_scene.objects.player.position.z = l.current_scene.objects.platform.mesh.position.z; 
        l.current_scene.objects.player.position.y = 500;
        
        
        l.scenograph.controls.orbitTarget.copy(l.current_scene.objects.player.position);
        l.scenograph.cameras.active.position.copy(l.current_scene.objects.player.position);
        l.scenograph.cameras.active.translateZ(-15);
        l.scenograph.cameras.orbit.updateProjectionMatrix();
        l.scenograph.controls.orbit.update();

        // @todo #31
        // - Implement first person controls
        // - Separate player from aircraft

    }

}
