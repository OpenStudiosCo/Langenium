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

        l.current_scene.objects.hangar.mesh.position.y = 15;

        // @todo #31
        // - Update player and hangar position to platform
        // - Implement first person controls
        // - Separate player from aircraft

    }

}
