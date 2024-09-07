/***
 * @name            Scanners
 * @description     Draws shapes that track the positions of other craft.
 * @namespace       l.scenograph.overlays.scanners
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

export default class Scanners {

    trackedObjects;

    constructor() {
        this.trackedObjects = [];

        this.trackedObjects.push({
            mesh: l.current_scene.objects.bot.mesh,
            symbol: this.getSymbolElement( 'diamond' ),
        });

        document.body.appendChild(this.trackedObjects[0].symbol);

        l.ui.targeting_scanner.needsUpdate = true;

    }

    /**
     * 
     * @param {*} symbol 
     * @returns custom HTMLElement
     */
    getSymbolElement( symbol ) {
        let element = document.createElement('div');
        element.id = 'overlay-scanner';
        element.style.position = 'absolute';
        element.style.border = 'solid 1px rgba(0, 255, 0, 1)';
        element.style.width = '10px';
        element.style.height = '10px';
        element.style.transform = 'rotate(45deg)';
        //this.testElement.style.borderRadius = '50%'; // Makes the element circular for visibility
        element.style.zIndex = '2'; // Ensures it's on top of other elements
        return element;
    }

    /**
     * Obtains the 2D screen co-ordinate for a 3D object target.
     * 
     * @param {*} THREE.Object3D currently in the scene
     * @returns [x,y] screen space coordinates
     */
    getSymbolPosition ( object ) {
        const vector = new THREE.Vector3();
        object.getWorldPosition(vector);
        vector.project(l.scenograph.cameras.active);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (1 - (vector.y * 0.5 + 0.5)) * window.innerHeight;
        return [ x, y ];
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
        const frustum = new THREE.Frustum()
        const matrix = new THREE.Matrix4().multiplyMatrices(l.scenograph.cameras.active.projectionMatrix, l.scenograph.cameras.active.matrixWorldInverse)
        frustum.setFromProjectionMatrix(matrix)
        
        l.scenograph.cameras.active.updateProjectionMatrix();
        l.scenograph.overlays.scanners.trackedObjects.forEach(trackedObject => {
            if (!frustum.containsPoint(trackedObject.mesh.position)) {
                trackedObject.symbol.style.display = `none`;
            }
            else {
                const [ x, y ] = l.scenograph.overlays.scanners.getSymbolPosition(trackedObject.mesh);

                trackedObject.symbol.style.left = `${x-5}px`;
                trackedObject.symbol.style.top = `${y-5}px`;
                trackedObject.symbol.style.display = `inherit`;
            }

        });
    }

}