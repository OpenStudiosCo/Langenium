/**
 * Triggers
 * 
 * Fires custom logic when certain conditions are true in the loop.
 * 
 * Each trigger has a constructing function that returns an object containing a way to update itself.
 */

export function setupTriggers() {
    //l.current_scene.triggers.updateSigns = updateSigns();
}

export function updateTriggers( currentTime ) {
    for ( var trigger in l.current_scene.triggers ) {
        l.current_scene.triggers[ trigger ].update( currentTime );
    }
}
