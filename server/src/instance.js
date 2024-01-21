/**
 * Instance
 * 
 * This class defines the functionality for the game's scene instances
 */

module.exports = class Instance {
    constructor() {
        /**
         * Contains all active scenes that clients can enter.
         */
        this.active_scenes = [];

        /**
         * Contains all the current connected clients.
         */
        this.client_sessions = [];
    }

    update(active_scene) {
        /**
         * Get the current delta.
         */
        let new_time = new Date().getTime();
        active_scene.delta = (new_time - active_scene.last_time);
        active_scene.last_time = new_time;

        /**
         * Process the active scenes update queue.
         */
        var processed_changes = [];

        active_scene.update_queue.forEach(function (update, index) {

            var _complete = function (processed_change) {
                processed_changes.push(processed_change);
                instance_obj.update_queue.splice(index, 1);

            };
            if (update.type == 'move_ship') {
                update.object.input_status = true;
            }
            modules.controllers.game.objects[update.obj_class][update.type](active_scene.delta, update, _complete)

        });


    }
};
