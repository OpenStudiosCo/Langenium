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
            symbol: this.getSymbolElement( 'diamond' ),
        });

        l.current_scene.objects.cargo_ships.forEach( async ( cargo_ship, i ) => {
            this.trackedObjects.push({
                mesh: cargo_ship,
                symbol: this.getSymbolElement( 'diamond' ),
            });
          } );

        this.trackedObjects.forEach( trackedObject => {
            this.container.appendChild( trackedObject.symbol );
        } );

        //l.ui.targeting.locked.needsUpdate = true;

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
     */
    getSymbolPosition ( object ) {
        const vector = new THREE.Vector3();
        object.getWorldPosition(vector);
        vector.project(l.scenograph.cameras.active);

        const x = (vector.x * 0.5 + 0.5) * l.scenograph.width;
        const y = (1 - (vector.y * 0.5 + 0.5)) * l.scenograph.height;
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
            let symbol = trackedObject.symbol.querySelector('.symbol');
            let targetingEffect = trackedObject.symbol.querySelector('.targeting-effect');
            let [ x, y ] = l.scenograph.overlays.scanners.getSymbolPosition(trackedObject.mesh);

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

            if (!frustum.containsPoint(trackedObject.mesh.position)) {

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
            //else {
                
            //}

            // Check if the object is within the scanner area.
            // @todo: Move scanner logic to aircraft equipment update code.
            if ( 
                x > l.scenograph.width * 0.375 &&
                x < l.scenograph.width * 0.625 &&
                y > l.scenograph.height * 0.375 &&
                y < l.scenograph.height * 0.625
            ) {
                symbol.style.background = 'rgba(200, 0, 200, 0.5)';
                symbol.style.border = 'solid 2px rgba(200, 0, 200, 1)';
                targetingEffect.style.display = 'block';
            }
            else {
                symbol.style.background = 'none';
                symbol.style.border = 'solid 1px rgba(0, 0, 200, 1)';
                targetingEffect.style.display = 'none';
            }

            trackedObject.symbol.style.left = `${x-5}px`;
            trackedObject.symbol.style.top = `${y-5}px`;

        });
    }

}