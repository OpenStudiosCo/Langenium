/**
 * @name            Routes
 * @description     Provides an interface to load and unload game modes and screens.
 * @namespace       l.routes
 * @memberof        l
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

import hangarRoute from '@/routes/hangar.js';
import multiPlayerRoute from '@/routes/multiplayer.js';
import singlePlayerRoute from '@/routes/singleplayer.js';

export default class routes {

    singlePlayer;

    constructor() {
        this.hangar = hangarRoute;
        this.multiPlayer = multiPlayerRoute;
        this.singlePlayer = singlePlayerRoute;
    }

    /**
     * Leave the current session and return to the post-intro demo view.
     */
    exitGame() {
        console.log( 'Exit to Main Menu, closing game session' );

        l.scenograph.controls.deactivate();
        l.scenograph.overlays.deactivate();

        if ( l.scenograph.modes.multiplayer.connected ) {
            l.scenograph.modes.multiplayer.disconnect();
        }

        if ( l.scenograph.hangar ) {
            l.scenograph.hangar.cancelSession();
        }

        for ( const actor of l.scenograph.actors.getAll() ) {
            if ( typeof actor.resetFlight === 'function' ) {
                actor.resetFlight();
            }
        }

        l.mode = 'home';
        this.restoreDemoView();
    }

    setDemoVisible( visible ) {
        const demo = l.current_scene.objects.demoShip;
        if ( ! demo || ! demo.mesh ) {
            return;
        }

        demo.mesh.visible = visible;
        demo.mesh.userData.targetable = visible;
        if ( demo.trail && demo.trail.mesh ) {
            demo.trail.mesh.visible = false;
        }
    }

    restoreDemoView() {
        const demo = l.current_scene.objects.demoShip;
        if ( ! demo ) {
            return;
        }

        for ( const actor of l.scenograph.actors.getAll() ) {
            if ( typeof actor.setVehicleVisible === 'function' ) {
                actor.setVehicleVisible( false );
            }
        }
        this.setDemoVisible( true );
        demo.resumeTour();
        l.current_scene.moving = false;
    }

}
