/**
 * @name            Single Player
 * @description     Managees the game client's single player mode.
 * @namespace       l.routes.singleplayer
 * @memberof        l.routes
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

export default class singlePlayerRoute {

    constructor() {
        console.log( 'Single player launched' );

        // Start controls.
        l.scenograph.controls.activate();

        // Start overlays.
        l.scenograph.overlays.activate();

        // Set client mode.
        l.mode = 'single_player';

        l.routes.setDemoVisible( false );

        const player = l.scenograph.actors.player || l.scenograph.actors.get( 'Player' );
        l.scenograph.actors.player = player;
        player.setVehicleVisible( true );
        player.setMode( 'vehicle' );
        player.vehicle.updateMesh();
        player.chaseYaw = player.vehicle.mesh.rotation.y;
        player.vehicle.applyChaseCamera( player.chaseYaw );

        if ( player.person && player.person.mesh ) {
            player.person.mesh.visible = false;
        }

        l.routes.hangar.watchOverworld();

    }

}
