/***
 * @name            Heads Up Display (HUD)
 * @description     Draws aircraft HUD
 * @namespace       l.scenograph.overlays.hud
 * @memberof        l.scenograph.overlays
 * @global
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';

/**
 * Vendor libs and base class.
 */
import * as THREE from "three";

export default class HeadsUpDisplay {

    constructor() {

        this.container = document.querySelector('#game_overlay #hud');

        this.portraitMode = l.scenograph.cameras.player.aspect < 0.88;

        // Create the vertical lines
        this.lineElement = document.createElement('div');
        this.lineElement.id = 'hud-lines';
        this.container.appendChild(this.lineElement);

        // Create the label to track air speed.
        this.aspdElement = this.createLabel( 'aspd', 'AIRSPEED: 0km/h');
        this.container.appendChild(this.aspdElement);

        // Create the label to track vertical speed.
        this.vspdElement = this.createLabel( 'vspd', 'VERT. SPD: 0km/h');
        this.container.appendChild(this.vspdElement);

        // Create the label to track air speed.
        this.headingElement = this.createLabel( 'head', 'HEADING: 0°');
        this.container.appendChild(this.headingElement);

        // Create the label to track elevation.
        this.elevationElement = this.createLabel( 'elev', 'ELEVATION: 0m');
        this.container.appendChild(this.elevationElement);

        // Create the power capacitor fuel gauge.
        this.capacitorElement = this.createCapacitorGauge();
        this.container.appendChild(this.capacitorElement);
        this.capacitorFillElement = this.capacitorElement.querySelector('.fill');

    }

    createLabel( keyName, labelText ) {
        let labelElement = document.createElement('div');
        labelElement.innerHTML = labelText;
        labelElement.id = 'hud-' + keyName;
        labelElement.dataset.id = keyName;
        return labelElement;
    }

    createCapacitorGauge() {
        let gauge = document.createElement('div');
        gauge.id = 'hud-capacitor';
        gauge.dataset.id = 'capacitor';

        let track = document.createElement('div');
        track.className = 'track';

        let fill = document.createElement('div');
        fill.className = 'fill';
        track.appendChild(fill);

        let label = document.createElement('div');
        label.className = 'label';
        label.textContent = 'CAP';

        gauge.appendChild(track);
        gauge.appendChild(label);
        return gauge;
    }

    /**
     * Animate hook.
     *
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     *
     * @method animate
     * @memberof HeadsUpDisplay
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate() {

        l.scenograph.overlays.hud.portraitMode = l.scenograph.cameras.player.aspect < 0.88;

        if ( l.scenograph.overlays.hud.portraitMode ) {
            l.scenograph.overlays.hud.container.classList.add('portrait');
        }
        else {
            l.scenograph.overlays.hud.container.classList.remove('portrait');
        }

        let ship = l.scenograph.actors.player.vehicle.mesh.userData.object;

        let aspd = -l.scenograph.overlays.hud.frameToSecond(ship.airSpeed);
        l.scenograph.overlays.hud.aspdElement.innerHTML = `AIRSPEED: ${aspd}km/h`;

        let vspd = l.scenograph.overlays.hud.frameToSecond(ship.verticalSpeed);
        l.scenograph.overlays.hud.vspdElement.innerHTML = `VERT. SPD: ${vspd}km/h`;

        let heading = THREE.MathUtils.radToDeg( l.scenograph.actors.player.vehicle.mesh.rotation.y );
        heading = heading % 360;
        if (heading < 0) {
            heading += 360;
        }
        heading = Math.round(360 - heading);
        l.scenograph.overlays.hud.headingElement.innerHTML = `HEADING: ${heading}°`;

        let elevation = Math.round( l.scenograph.actors.player.vehicle.mesh.position.y * 100 ) / 100;
        l.scenograph.overlays.hud.elevationElement.innerHTML = `ELEVATION: ${elevation}m`;

        let charge = Math.max( 0, Math.min( 1, ship.capacitor ) );
        let overdrive = Math.abs( ship.airSpeed ) > ship.cruiseForward;
        l.scenograph.overlays.hud.capacitorFillElement.style.width = ( Math.round( charge * 100 ) ) + '%';
        l.scenograph.overlays.hud.capacitorElement.classList.toggle( 'draining', overdrive && charge > 0 );
        l.scenograph.overlays.hud.capacitorElement.classList.toggle( 'empty', charge <= 0 );
    }

    /**
     * Converts velocity on a per frame basis to per second using FPS.
     */
    frameToSecond( metersPerFrame ) {
        let metersPerSecond = metersPerFrame * l.current_scene.stats.fps;
        metersPerSecond = Math.round( metersPerSecond * 100 ) / 100;
        return metersPerSecond;
    }

}
