/***
 * @name            Map
 * @description     Player's mini map
 * @namespace       l.scenograph.overlays.map
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

export default class Map {

    constructor() {

        this.container = document.querySelector('#game_overlay #map');

        this.icons = document.querySelector('#templates #map_icons');

        // // Create the vertical lines
        // this.lineElement = document.createElement('div');
        // this.lineElement.id = 'hud-lines';
        // this.container.appendChild(this.lineElement);

        // // Create the label to track air speed.
        // this.aspdElement = this.createLabel( 'aspd', 'AIRSPEED: 0km/h');
        // this.container.appendChild(this.aspdElement);

        // // Create the label to track vertical speed.
        // this.vspdElement = this.createLabel( 'vspd', 'VERT. SPD: 0km/h');
        // this.container.appendChild(this.vspdElement);

        // // Create the label to track air speed.
        // this.headingElement = this.createLabel( 'head', 'HEADING: 0°');
        // this.container.appendChild(this.headingElement);

        // // Create the label to track vertical speed.
        // this.elevationElement = this.createLabel( 'elev', 'ELEVATION: 0m');
        // this.container.appendChild(this.elevationElement);

    }

    /**
     * Animate hook.
     * 
     * This method is called within the main animation loop and
     * therefore must only reference global objects or properties.
     * 
     * @method animate
     * @memberof Map
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate() {

    }

}
