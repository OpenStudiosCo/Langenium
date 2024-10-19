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
    container;

    trackedObjects;

    constructor() {
        this.offset = 10;
        this.container = document.querySelector('#game_overlay #scanner_targets');

        this.item_template = document.getElementById( 'overlays_scanner_target' ).innerHTML;

        this.trackedObjects = [];

        this.trackedObjects.push({
            mesh: l.current_scene.objects.bot.mesh,
            domElement: this.getSymbolElement( 'diamond' )
        });

        l.current_scene.objects.cargo_ships.forEach( async ( cargo_ship, i ) => {
            this.trackedObjects.push({
                mesh: cargo_ship,
                domElement: this.getSymbolElement( 'diamond' )
            });
          } );

        this.trackedObjects.forEach( trackedObject => {
            this.container.appendChild( trackedObject.domElement );
        } );

    }

    /**
     * 
     * @param {*} symbol 
     * @returns custom HTMLElement
     */
    getSymbolElement( symbol ) {
        let element = document.createElement('div');
        element.innerHTML = this.item_template;
        return element.firstChild;
    }

    /**
     * Obtains the 2D screen co-ordinate for a 3D object target.
     * 
     * @param {*} THREE.Object3D currently in the scene
     * @returns [x,y] screen space coordinates
     * @global
     * @note All references within this method should be globally accessible.
     */
    animateSymbolPosition ( object, frustum ) {
        const vector = new THREE.Vector3();
        object.getWorldPosition(vector);
        vector.project(l.scenograph.cameras.active);

        let x = (vector.x * 0.5 + 0.5) * l.scenograph.width;
        let y = (1 - (vector.y * 0.5 + 0.5)) * l.scenograph.height;

        if ( x < l.scenograph.overlays.scanners.offset ) {
            x = l.scenograph.overlays.scanners.offset;
        }

        if ( y < l.scenograph.overlays.scanners.offset ) {
            y = l.scenograph.overlays.scanners.offset;
        }

        if ( x > l.scenograph.width - l.scenograph.overlays.scanners.offset ) {
            x = l.scenograph.width - l.scenograph.overlays.scanners.offset;
        }

        if ( y > l.scenograph.height - l.scenograph.overlays.scanners.offset ) {
            y = l.scenograph.height - l.scenograph.overlays.scanners.offset;
        }

        if (!frustum.containsPoint(object.position)) {

            let diffX = (l.scenograph.width / 2) - x ;
            let diffZ = (l.scenograph.height / 2) - y ;

            if (Math.abs(diffX) > Math.abs(diffZ)) {
                if ( diffX < 0 ) {
                    x = l.scenograph.width - l.scenograph.overlays.scanners.offset;
                }
                else {
                    x = l.scenograph.overlays.scanners.offset;
                }
            }
            else {
                if ( diffZ < 0 ) {
                    y = l.scenograph.height - l.scenograph.overlays.scanners.offset;
                }
                else {
                    y = l.scenograph.overlays.scanners.offset;
                }
            }

        }

        return [ x, y ];
    }

    /**
     * Animates the tracked object.
     * 
     * @param {*} trackedObject 
     * @param {*} frustum 
     */
    animateTrackedObject( trackedObject, frustum ) {
        let [ x, y ] = l.scenograph.overlays.scanners.animateSymbolPosition(trackedObject.mesh, frustum);

        // Check if the object is within the scanner area.
        if ( l.scenograph.overlays.scanners.getTargetLock( x, y ) ) {
            trackedObject.domElement.classList.add('active');
        }
        else {
            trackedObject.domElement.classList.remove('active');
        }

        trackedObject.domElement.style.left = `${x-5}px`;
        trackedObject.domElement.style.top = `${y-5}px`;
    }

    // @todo: Move scanner logic to aircraft equipment update code.
    getTargetLock( x, y ) {
        if ( 
            x > l.scenograph.width * 0.375 &&
            x < l.scenograph.width * 0.625 &&
            y > l.scenograph.height * 0.375 &&
            y < l.scenograph.height * 0.625
        ) {
            return true;
        }
        else {
            return false;
        }
    }

    animateTarget() {

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
            l.scenograph.overlays.scanners.animateTrackedObject(trackedObject, frustum);
        });
    }

}
