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
        this.lineElement.style.borderRadius = '5%'; // Makes the element circular for visibility
        this.lineElement.style.zIndex = '2'; // Ensures it's on top of other elements
        document.body.appendChild(this.lineElement);

        // Create the label to track air speed.

    }

    createLabel( keyName, labelText ) {
        
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
        
    }

}