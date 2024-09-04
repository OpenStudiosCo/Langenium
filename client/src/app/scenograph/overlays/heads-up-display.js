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

        // Create the vertical lines
        this.lineElement = document.createElement('div');
        this.lineElement.id = 'overlay-hud-lines';
        this.lineElement.style.position = 'absolute';
        this.lineElement.style.borderLeft = 'solid 1px rgba(0, 255, 0, 1)';
        this.lineElement.style.borderRight = 'solid 1px rgba(0, 255, 0, 1)';
        this.lineElement.style.top = '17.5vh';
        this.lineElement.style.left = '17.5vw';
        this.lineElement.style.width = '65vw';
        this.lineElement.style.height = '65vh';
        this.lineElement.style.borderRadius = '10% / 50%'; // Makes the element circular for visibility
        this.lineElement.style.zIndex = '2'; // Ensures it's on top of other elements
        this.lineElement.style.pointerEvents = 'none';
        document.body.appendChild(this.lineElement);

        // Create the label to track air speed.
        this.aspdElement = this.createLabel( 'aspd', 'AIRSPEED: 0km/h');
        this.aspdElement.style.bottom = '12.5vh';
        this.aspdElement.style.left = '12.5vw';
        document.body.appendChild(this.aspdElement);

        // Create the label to track vertical speed.
        this.vspdElement = this.createLabel( 'vspd', 'VERT. SPD: 0km/h');
        this.vspdElement.style.bottom = '12.5vh';
        this.vspdElement.style.right = '12.5vw';
        document.body.appendChild(this.vspdElement);

        // Create the label to track air speed.
        this.headingElement = this.createLabel( 'aspd', 'HEADING: 0°');
        this.headingElement.style.top = '12.5vh';
        this.headingElement.style.left = '12.5vw';
        document.body.appendChild(this.headingElement);

        // Create the label to track vertical speed.
        this.elevationElement = this.createLabel( 'vspd', 'ELEVATION: 0m');
        this.elevationElement.style.top = '12.5vh';
        this.elevationElement.style.right = '12.5vw';
        document.body.appendChild(this.elevationElement);

    }

    createLabel( keyName, labelText ) {
        let labelElement = document.createElement('div');
        labelElement.innerHTML = labelText;
        labelElement.id = 'overlay-hud-label-' + keyName;
        labelElement.dataset.id = keyName;
        labelElement.style.position = 'absolute';
        labelElement.style.color = 'rgba(0, 255, 0, 1)';
        labelElement.style.fontFamily = 'monospace';
        labelElement.style.zIndex = '2'; // Ensures it's on top of other elements
        labelElement.style.pointerEvents = 'none';
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