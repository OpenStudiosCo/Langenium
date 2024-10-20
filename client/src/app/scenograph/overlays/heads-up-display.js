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

        // Create the label to track vertical speed.
        this.elevationElement = this.createLabel( 'elev', 'ELEVATION: 0m');
        this.container.appendChild(this.elevationElement);

    }

    createLabel( keyName, labelText ) {
        let labelElement = document.createElement('div');
        labelElement.innerHTML = labelText;
        labelElement.id = 'hud-' + keyName;
        labelElement.dataset.id = keyName;
        return labelElement;
    }

    /**
     * Animate hook.
     * 
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     * 
     * @method animate
     * @memberof Scanners
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

        let aspd = -l.scenograph.overlays.hud.frameToSecond(l.current_scene.objects.player.state.airSpeed);
        l.scenograph.overlays.hud.aspdElement.innerHTML = `AIRSPEED: ${aspd}km/h`;

        let vspd = l.scenograph.overlays.hud.frameToSecond(l.current_scene.objects.player.state.verticalSpeed);
        l.scenograph.overlays.hud.vspdElement.innerHTML = `VERT. SPD: ${vspd}km/h`;

        let heading = THREE.MathUtils.radToDeg( l.current_scene.objects.player.state.rotation.y );
        heading = heading % 360;
        if (heading < 0) {
            heading += 360;
        }
        heading = Math.round(360 - heading);
        l.scenograph.overlays.hud.headingElement.innerHTML = `HEADING: ${heading}°`;

        let elevation = Math.round( l.current_scene.objects.player.state.position.y * 100 ) / 100;
        l.scenograph.overlays.hud.elevationElement.innerHTML = `ELEVATION: ${elevation}m`;
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