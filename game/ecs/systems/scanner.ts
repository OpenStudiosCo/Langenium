import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";

export function scannerSystem(entities: Map<string, any>, deltaMs: number) {
    const dt = deltaMs / 1000; // convert ms to seconds

    // Get list of targetable things in the entire scene.
    let targetable = [];
    for (const entity of entities.values()) {
        // Check if they are targetable based on having HP config.
        // @todo: Find a tidier way to do this
        if (entity.config.components.Health) {
            targetable.push(entity);
        }
    }

    // Update all scanner components with their individual target lists based on line of sight.
    for (const entity of entities.values()) {
        if (entity.components.Scanner) {
            for (const target of targetable) {

                // Skip self.
                if (entity.components.Name === target.components.Name) {
                    continue;
                }
                console.log(entity, target);
                debugger;
                const targetVisible = entity.components.AI.entity.vision.visible(target.mesh.position) === true;
            }

        }
    }
    debugger;
}

// getTargetable() {
//     return this.scene.children.filter( scene_obj =>
//         scene_obj.userData.targetable
//     );
// }

// export function scan( delta ) {
//     let currentTargets = this.getTargetable();

//     // Check if we are already tracking this target.
//     this.targets.forEach( ( target, index ) => {

//         let trackingObject = currentTargets.filter( object => (object.uuid == target.mesh.uuid ) );
//         trackingObject = trackingObject.length > 0 ? trackingObject[0] : false;

//         // Remove tracking if object no longer in the scene.
//         if ( ! trackingObject ) {
//             this.targets.splice( index, 1 );
//         }
//     } );

//     // Update targets tracked in the array.
//     for ( const target of currentTargets ) {

//         // Skip self.
//         if ( target.uuid === this.mesh.uuid ) {
//             continue;
//         }

//         // Check if we are already tracking this target.
//         let trackingObject = this.targets.filter( object => (object.mesh.uuid == target.uuid ) );
//         trackingObject = trackingObject.length > 0 ? trackingObject[0] : false;

//         if ( ! trackingObject ) {
//             trackingObject = {
//                 mesh: target,
//                 locked: false,
//                 locking: false,
//                 tracking: false,
//                 scanTime: 0,
//                 lostTime: 0
//             }
//             this.targets.push( trackingObject );
//         }

//     }

//     // Update the targets scanner statuses.
//     this.targets.forEach( ( target, index ) => {
//         const targetVisible = this.entity.vision.visible( target.mesh.position ) === true;

//         // If the scanner's vision can see the target, start scanning.
//         if ( targetVisible ) {
//             target.tracking = true;
//             target.scanTime += delta;
//             target.lostTime = 0;

//             if ( target.scanTime >= 1 ) {
//                 if ( target.scanTime >= 3 ) {
//                     target.locked = true;
//                     target.locking = false;
//                 }
//                 else {
//                     target.locked = false;
//                     target.locking = true;
//                 }
//             }
//             else {
//                 target.locked = false;
//                 target.locking = false;
//             }
//         }
//         else {
//             target.lostTime += delta;

//             if ( target.scanTime < 1 ) {
//                 target.scanTime = 0;
//                 target.lostTime = 0;
//             }
//             else {
//                 // Allow 3 seconds before a target is downgraded when locked.
//                 if ( target.lostTime >= 3 && target.locked ) {
//                     target.locked = false;

//                     target.lostTime = 0;
//                 }
//                 else {
//                     // Allow 1 seconds before a target is downgraded when locking.
//                     if ( target.lostTime >= 1 && target.locking ) {
//                         target.locking = false;

//                         target.lostTime = 0;
//                     }
//                 }

//                 // Allow 1 seconds before a target is lost when tracking.
//                 if (
//                     target.lostTime >= 1 &&
//                     target.tracking &&
//                     ! target.locked &&
//                     ! target.locking
//                 ) {
//                     target.scanTime = 0;
//                     target.lostTime = 0;
//                     target.locked = false;
//                     target.locking = false;
//                 }

//             }
//         }
//     } );

// }

// untrackTarget( uuid ) {
//     this.targets.forEach( ( target ) => {
//         if ( target.mesh.uuid == uuid ) {
//             target.locked   = false;
//             target.locking  = false;
//             target.tracking = false;
//             target.scanTime = 0;
//         }
//     });
// }
