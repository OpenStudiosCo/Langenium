/**
 * Scanner Systems
 * 
 * A scanner system that locks onto nearby targets for other systems to talk to.
 * - Player UI overlay
 * - Weapons fire
 */
import * as YUKA from 'yuka';

import BaseSystem from './base';

export default class Scanners extends BaseSystem {

    entity;
    mesh;
    scene;
    targets;

    constructor( entity, mesh, scene ) {
        super( );

        this.entity = entity;
        
        this.mesh = mesh;

        this.scene = scene;

        this.targets = [];

        this.timeout = 500;

        const vision = new YUKA.Vision( this.entity );
        vision.range = 1500;
        vision.fieldOfView = Math.PI * 2;
        this.entity.vision = vision;
    }

    /**
     * Called within animation loop.
     * 
     * Requires array of scene children to be sent in.
     *
     * @param scene_children 
     * @returns 
     */
    getTargetable() {
        return this.scene.children.filter( scene_obj => 
            scene_obj.userData.targetable
        );
    }

    scan( delta ) {

        // Update targets tracked in the array.
        for ( const target of this.getTargetable() ) {

            // Skip self.
            if ( target.uuid === this.mesh.uuid ) {
                continue;
            }

            // Check if we are already tracking this target.
            let trackingObject = this.targets.filter( object => object.mesh.uuid === target.uuid );
            trackingObject = trackingObject.length > 0 ? trackingObject[0] : false;
        
            if ( ! trackingObject ) {
                trackingObject = {
                    mesh: target,
                    locked: false,
                    locking: false,
                    tracking: false,
                    scanTime: 0,
                    lostTime: 0
                }
                this.targets.push( trackingObject );
            }
            
        }
        this.targets.forEach( ( target, index ) => {
            const targetVisible = this.entity.vision.visible( target.mesh.position ) === true;

            // If the scanner's vision can see the target, start scanning.
            if ( targetVisible ) {
                target.tracking = true;
                target.scanTime += delta;
                target.lostTime = 0;

                if ( target.scanTime >= 1 ) {
                    if ( target.scanTime >= 3 ) {
                        target.locked = true;
                        target.locking = false;
                    }
                    else {
                        target.locked = false;
                        target.locking = true;
                    }
                }
                else {
                    target.locked = false;
                    target.locking = false;
                }
            }
            else {
                target.lostTime += delta;

                if ( target.scanTime < 1 ) {
                    target.scanTime = 0;
                    target.lostTime = 0;
                }
                else {
                    // Allow 3 seconds before a target is downgraded when locked.
                    if ( target.lostTime >= 3 && target.locked ) {
                        target.locked = false;
    
                        target.lostTime = 0;
                    }
                    else {
                        // Allow 1 seconds before a target is downgraded when locking.
                        if ( target.lostTime >= 1 && target.locking ) {
                            target.locking = false;
    
                            target.lostTime = 0;
                        }
                    }
    
                    // Allow 1 seconds before a target is lost when tracking.
                    if ( 
                        target.lostTime >= 1 &&
                        target.tracking &&
                        ! target.locked &&
                        ! target.locking 
                    ) {
                        target.scanTime = 0;
                        target.lostTime = 0;
                        target.locked = false;
                        target.locking = false;
                    }
    
                }
            }
        } );
        console.log(this.targets);
    }



    animate ( delta ) {

        if ( parseInt( l.current_scene.stats.currentTime ) >= parseInt(this.last) + parseInt(this.timeout) ) {
            this.scan( delta );
            this.last = l.current_scene.stats.currentTime;
        }

    }
}
