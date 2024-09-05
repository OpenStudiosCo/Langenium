/***
 * @name            Targeting Scanner
 * @description     Target list and management screen
 * @namespace       l.ui.targetting_scanner
 * @memberof        l.ui
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

export default class Targeting_Scanner {

    constructor() {

        // Create the targetting scanner container
        this.lineElement = document.createElement('div');
        this.lineElement.id = 'ui-targeting-container';
        this.lineElement.style.position = 'absolute';
        this.lineElement.style.background = 'rgba(0, 0, 0, 0.5)';
        this.lineElement.style.bottom = '1vh';
        this.lineElement.style.left = '35vw';
        this.lineElement.style.width = '30vw';
        this.lineElement.style.height = '15vh';
        this.lineElement.style.borderRadius = '10%'; // Makes the element circular for visibility
        this.lineElement.style.zIndex = '2'; // Ensures it's on top of other elements
        this.lineElement.style.pointerEvents = 'none';
        document.body.appendChild(this.lineElement);
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