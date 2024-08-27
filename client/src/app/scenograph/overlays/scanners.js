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

        // Create a test HTML element
        this.testElement = document.createElement('div');
        this.testElement.style.position = 'absolute';
        this.testElement.style.border = 'solid 1px rgba(0, 255, 0, 0.5)';
        this.testElement.style.width = '10px';
        this.testElement.style.height = '10px';
        this.testElement.style.transform = 'rotate(45deg)';
        //this.testElement.style.borderRadius = '50%'; // Makes the element circular for visibility
        this.testElement.style.zIndex = '9999'; // Ensures it's on top of other elements
        document.body.appendChild(this.testElement);
    
    }

    addToScene( scene ) {
        // this.trackedObjects.forEach( ( trackedObject ) => {
        //     scene.add( trackedObject.symbol );
        // } );
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

            l.scenograph.overlays.scanners.testElement.style.left = `${x-5}px`;
            l.scenograph.overlays.scanners.testElement.style.top = `${y-5}px`;

            // // Convert screen coordinates to normalized device coordinates (NDC)
            // const vector = new THREE.Vector3(
            //     (x / window.innerWidth) * 2 - 1,
            //     - (y / window.innerHeight) * 2 + 1,
            //     0.5 // Depth (Z) value, which can be adjusted based on distance
            // );

            // // Unproject vector to 3D world space
            // vector.unproject(l.scenograph.cameras.active);

            // // Update symbol position
            // trackedObject.symbol.position.copy(trackedObject.mesh.position);

            // // Calculate distance from the camera
            // const distance = l.scenograph.cameras.active.position.distanceTo(trackedObject.mesh.position);

            // // Scale factor to keep the diamond size consistent
            // const scale = 1 - (100 / (distance * Math.abs(vector.z)));

            // console.log( distance );

            // if (distance > 2500) {
            //     l.scenograph.overlays.scanners.testElement.style.display ='block';
            //     trackedObject.symbol.visible = false;
            // }
            // else {
            //     l.scenograph.overlays.scanners.testElement.style.display ='none';
            //     trackedObject.symbol.visible = true;
            // }

            // // Apply scaling to the symbol
            // trackedObject.symbol.scale.set(scale, scale, scale);

            // trackedObject.symbol.lookAt(l.scenograph.cameras.active.position);
        });
    }

}