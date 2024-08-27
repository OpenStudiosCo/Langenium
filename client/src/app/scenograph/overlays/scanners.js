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
            symbol: this.createDiamond(),
        });
    
    }

    addToScene( scene ) {
        this.trackedObjects.forEach( ( trackedObject ) => {
            scene.add( trackedObject.symbol );
        } );
    }

    getSymbolPosition ( object ) {
        const vector = new THREE.Vector3();
        object.getWorldPosition(vector);
        vector.project(l.scenograph.cameras.active);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (1 - (vector.y * 0.5 + 0.5)) * window.innerHeight;
        const z = 0;
        return [ x, y, vector.z ];
    }

    createDiamond() {
        const material = new THREE.LineBasicMaterial({
            color: 0x00ff00
        });
        
        const points = [];
        points.push( new THREE.Vector3( 0, 10, 0 ) );
        points.push( new THREE.Vector3( -10, 0, 0 ) );
        points.push( new THREE.Vector3( 0, -10, 0 ) );
        points.push( new THREE.Vector3( 10, 0, 0 ) );
        points.push( new THREE.Vector3( 0, 10, 0 ) );
        
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        
        const line = new THREE.Line( geometry, material );
        return line;
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
        l.scenograph.cameras.active.updateProjectionMatrix();
        l.scenograph.overlays.scanners.trackedObjects.forEach(trackedObject => {
            const [x, y, z] = l.scenograph.overlays.scanners.getSymbolPosition(trackedObject.mesh);

            // Convert screen coordinates to normalized device coordinates (NDC)
            const vector = new THREE.Vector3(
                (x / window.innerWidth) * 2 - 1,
                - (y / window.innerHeight) * 2 + 1,
                0.5 // Depth (Z) value, which can be adjusted based on distance
            );
            

            trackedObject.symbol.position.copy(trackedObject.mesh.position);
            trackedObject.symbol.lookAt(l.scenograph.cameras.active.position);
        });
    }

}