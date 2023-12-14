/**
 * Triggers
 * 
 * Fires custom logic when certain conditions are true in the loop.
 * 
 * Each trigger has a constructing function that returns an object containing a way to update itself.
 */

export function setupTriggers ( ) {
    //window.test_scene.triggers.updateSigns = updateSigns();
}

export function updateTriggers ( currentTime ) {
    for (var trigger in window.test_scene.triggers) {
        window.test_scene.triggers[trigger].update(currentTime);
    }
}
