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

        // Visibility range in meters.
        this.zoom = 1000;

        // Reusable icon SVGs
        this.icons = this.getIconSVGs();

        // Create the fov icon
        this.fov = document.createElement('div');
        this.fov.id = 'map-fov';
        this.container.appendChild(this.fov);

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

    getIconSVGs() {
        let icons = {};
        let iconTemplate = document.createElement('div');
        iconTemplate.innerHTML = document.querySelector('#templates #map_icons').innerHTML;

        icons.aircraft = iconTemplate.querySelector('.aircraft').innerHTML;
        icons.ship = iconTemplate.querySelector('.ship').innerHTML;
        icons.special = iconTemplate.querySelector('.special').innerHTML;
        icons.structure = iconTemplate.querySelector('.structure').innerHTML;

        return icons;
    }

    /**
     * Adds and removes icons from the map based on proximity and zoom level.
     */
    updateMapIcons() {

    }

    /**
     * Animates the mini map position of symbol
     */
    animateMapIcons() {

    }

    /**
     * Animate hook.
     * 
     * This method is called within the main animation loop andw
     * therefore must only reference global objects or properties.
     * 
     * @method animate
     * @memberof Map
     * @global
     * @note All references within this method should be globally accessible.
    **/
    animate() {
        let heading = THREE.MathUtils.radToDeg( l.current_scene.objects.player.state.rotation.y );
        heading = heading % 360;
        if (heading < 0) {
            heading += 360;
        }
        heading = Math.round(360 - heading);

        l.scenograph.overlays.map.container.style.transform = 'rotate(' + heading + 'deg)';
    }

}
