/**
 * @name            Overlays
 * @description     Provides 2D overlays to the 3D environment.
 * @namespace       l.scenograph.overlays
 * @memberof        l.scenograph
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import AxisOrbit from '@/scenograph/overlays/axis_orbit.js';
import HeadsUpDisplay from '@/scenograph/overlays/heads-up-display.js';
import Map from '@/scenograph/overlays/map.js';
import Scanners from '@/scenograph/overlays/scanners.js';

export default class Overlays {
    axis_orbit;

    hud;

    scanners;

    constructor() {}

    /**
     * Create or show the axis-orbit chrome. Hangar uses this without full flight HUD.
     */
    ensureAxisOrbit( show = true ) {
        if ( show ) {
            if ( ! this.axis_orbit ) {
                this.axis_orbit = new AxisOrbit();
                l.current_scene.animation_queue.push( this.axis_orbit.animate );
            }
            this.axis_orbit.setVisible( true );
            return;
        }

        if ( this.axis_orbit ) {
            this.axis_orbit.setVisible( false );
        }
    }

    activate() {
        // Heads Up Display (HUD).
        l.scenograph.overlays.hud = new HeadsUpDisplay();
        l.current_scene.animation_queue.push(
            l.scenograph.overlays.hud.animate
        );

        // Mini Map.
        l.scenograph.overlays.map = new Map();
        l.current_scene.animation_queue.push(
            l.scenograph.overlays.map.animate
        );

        // Axis orbit control under the minimap (flight and hangar).
        this.ensureAxisOrbit( true );

        // Scanners.
        l.scenograph.overlays.scanners = new Scanners();
        l.current_scene.animation_queue.push(
            l.scenograph.overlays.scanners.animate
        );
        l.ui.update_queue.push( {
            callback: 'l.scenograph.controls.touch.weapons.update',
            data: []
        } );

    }

    deactivate() {
        const drop = new Set();

        if ( this.hud ) {
            drop.add( this.hud.animate );
            if ( this.hud.container ) {
                this.hud.container.innerHTML = '';
            }
            this.hud = false;
        }

        if ( this.map ) {
            drop.add( this.map.animate );
            if ( this.map.container ) {
                this.map.container.innerHTML = '';
                this.map.container.style.display = 'none';
            }
            this.map = false;
        }

        if ( this.axis_orbit ) {
            drop.add( this.axis_orbit.animate );
            this.axis_orbit.dispose();
            this.axis_orbit = false;
        }

        if ( this.scanners ) {
            drop.add( this.scanners.animate );
            if ( this.scanners.container ) {
                this.scanners.container.innerHTML = '';
            }
            this.scanners = false;
        }

        if ( drop.size ) {
            l.current_scene.animation_queue = l.current_scene.animation_queue.filter(
                fn => ! drop.has( fn )
            );
        }

        if ( l.ui && l.ui.update_queue ) {
            l.ui.update_queue = l.ui.update_queue.filter(
                item => item.callback !== 'l.scenograph.controls.touch.weapons.update'
            );
        }
    }
}
