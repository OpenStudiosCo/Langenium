/***
 * @name            Scanners
 * @description     Draws shapes that track the players scanners.
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

        this.trackedObjects = {};

    }

    /**
     * Get the marker symbol.
     *
     * @param {*} symbol 
     * @returns custom HTMLElement
     */
    getSymbolElement( symbol ) {
        let element = document.createElement('div');
        element.innerHTML = this.item_template;
        element.querySelector('.symbol').innerHTML = l.scenograph.overlays.map.icons[ symbol ];
        element.firstChild.classList.add( symbol );
        const shape = element.querySelector('.symbol path, .symbol rect');
        
        if ( shape.style ) {
            shape.style = '';
        }
        
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
    getScreenCoordinates ( object, frustum ) {
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
    animate( delta ) {
        
        const frustum = new THREE.Frustum()
        const matrix = new THREE.Matrix4().multiplyMatrices(l.scenograph.cameras.active.projectionMatrix, l.scenograph.cameras.active.matrixWorldInverse)
        frustum.setFromProjectionMatrix(matrix)        
        l.scenograph.cameras.active.updateProjectionMatrix();

        // Use the players scanners to update the overlays.
        l.current_scene.objects.player.actor.scanners.targets.forEach( target => l.scenograph.overlays.scanners.animateTarget( delta, target, frustum ) );

        l.scenograph.overlays.scanners.removeOldTargets();

    }

    /**
     * Animate the target in the UI overlay
     * 
     * @param {*} delta 
     * @param {*} trackedObject 
     * @param {*} frustum 
     */
    animateTarget( delta, target, frustum ) {
        let [ x, y ] = l.scenograph.overlays.scanners.getScreenCoordinates( target.mesh, frustum );
        let domElement = l.scenograph.overlays.scanners.getTargetDomElement( target );

        if ( target.scanTime > 0 ) {
            if ( target.scanTime >= 3 ) {
                domElement.classList.add('locked');
                domElement.classList.remove('locking');
            }
            else {
                if ( target.scanTime >= 1 ) {
                    domElement.classList.add('locking');
                    domElement.classList.remove('locked');
                }
                else {
                    domElement.classList.add('tracking');
                    domElement.classList.remove('locked');
                    domElement.classList.remove('locking');    
                }   
            }

        }
        else {
            domElement.classList.remove('tracking');
            domElement.classList.remove('locked');
            domElement.classList.remove('locking');
        }

        domElement.style.left = `${x-10}px`;
        domElement.style.top = `${y-10}px`;
    }

    /**
     * Remove markers for objects no longer in the scene.
     */
    removeOldTargets() {

        for ( const uuid in l.scenograph.overlays.scanners.trackedObjects ) {
            const sceneObject = l.current_scene.scene.children.filter( mesh => mesh.uuid == uuid );
            if ( sceneObject.length == 0 ) {
                // Remove the marker from the overlay.
                l.scenograph.overlays.scanners.container.removeChild( l.scenograph.overlays.scanners.trackedObjects[uuid] );

                // Delete the marker domElement from memory.
                delete l.scenograph.overlays.scanners.trackedObjects[ uuid ];
            }
        }

    }

    /**
     * Grabs or creates a Dom Element for each target.
     */
    getTargetDomElement( target ) {
        let trackedObject = l.scenograph.overlays.scanners.trackedObjects[ target.mesh.uuid ];

        if ( ! trackedObject ) {

            // Object icon look up table.
            const objectIcons = {
                'bot': 'aircraft',
                'cargoShip': 'ship',
                'city': 'structure',
                'extractors': 'structure',
                'missiles': 'aircraft',
                'player': 'aircraft',
                'refinery': 'structure',
            }

            let symbol = objectIcons[ target.mesh.userData.objectClass ];

            l.scenograph.overlays.scanners.trackedObjects[ target.mesh.uuid ] = l.scenograph.overlays.scanners.getSymbolElement( symbol );
            trackedObject = l.scenograph.overlays.scanners.trackedObjects[ target.mesh.uuid ];
            l.scenograph.overlays.scanners.container.appendChild( trackedObject );
        }

        return trackedObject;

    }

}
