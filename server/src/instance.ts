/**
 * Instance
 * 
 * This class defines the functionality for the game's scene instances
 */
import Valiant from '../../game/src/objects/aircraft/valiant';

let modules;

module.exports = class Instance {
    constructor( modules_object ) {
        /**
         * Contains all active scenes that clients can enter.
         */
        this.active_scenes = [];

        /**
         * Contains all the current connected clients.
         */
        this.client_sessions = [];

        /**
         * Active Scene default settings.
         */
        this.default_scene_settings = {
            scene_id: false,
            name: false,
            description: false,
            environment: false,
            startup: false,
            last_time: false,
            delta: false,
            interval_ticks: false,
            transmit_interval: false,
            // Track all objects currently in the instance.
            objects: {
                bots: [],
                characters: [],
                environment: [],
                players: [],
                ships: []
            },
            // Update queue processes new changes and is purged every update().
            update_queue: [],
            // Animation queue processes ongoing scene changes every update().
            animation_queue: [],
        };

        modules = modules_object;

    }

    update(active_scene) {
        /**
         * Get the current delta.
         */
        let new_time = new Date().getTime();
        active_scene.delta = (new_time - active_scene.last_time);
        active_scene.last_time = new_time;

        // Prepare the log of processed changes to send to the client for this update tick.
        let processed_changes = [];

        // Move all ships
        active_scene.objects.ships.forEach((ship) => {
            ship.move( active_scene.delta );
            
        });

        // /**
        //  * Process the active scenes update queue.
        //  */
        // active_scene.update_queue.forEach(function (update, index) {

        //     let _complete = function (processed_change) {
        //         processed_changes.push(processed_change);
        //         active_scene.update_queue.splice(index, 1);
        //     };



        //     modules.controllers.game.objects[update.obj_class][update.type](active_scene.delta, update, _complete)

        // });

        // /**
        //  * Process the active scenes animation queue.
        //  */
        // active_scene.animation_queue.forEach(function (update, index) {

        //     let _complete = function (processed_change) {
        //         processed_changes.push(processed_change);
        //     };

        //     modules.controllers.game.objects[update.obj_class][update.type](active_scene.delta, update, _complete)

        // });

    }

    client_setup = function (user, socket, active_scene) {
        console.log('Player connected');
        socket.emit('load_scene', {
            objects: active_scene.objects
        });

        // var mesh_callback = function (instance_array_object, objects) {
        //     var instruction = modules.models.game.client.message.load_object.model({
        //         _id: instance_array_object._id,
        //         category: instance_array_object.category,
        //         url: objects[0].details.url,
        //         status: 'Saved',
        //         details: {
        //             object_id: objects[0]._id,
        //             name: objects[0].name,
        //             type: objects[0].type,
        //             sub_type: objects[0].sub_type
        //         },
        //         position: {
        //             x: instance_array_object.category == 'ships' ? user.position.x : instance_array_object.position.x,
        //             y: instance_array_object.category == 'ships' ? user.position.y : instance_array_object.position.y,
        //             z: instance_array_object.category == 'ships' ? user.position.z : instance_array_object.position.z
        //         },
        //         rotation: {
        //             x: instance_array_object.category == 'ships' ? user.rotation.x : instance_array_object.rotation.x,
        //             y: instance_array_object.category == 'ships' ? user.rotation.y : instance_array_object.rotation.y,
        //             z: instance_array_object.category == 'ships' ? user.rotation.z : instance_array_object.rotation.z,
        //         },
        //         scale: {
        //             x: instance_array_object.scale ? instance_array_object.scale.x : objects[0].details.scale.x,
        //             y: instance_array_object.scale ? instance_array_object.scale.y : objects[0].details.scale.y,
        //             z: instance_array_object.scale ? instance_array_object.scale.z : objects[0].details.scale.z
        //         }
        //     });

        //     if (instance_array_object.category == 'ships') {
        //         instance.client_sessions.forEach(function (session, index) {
        //             if (instance_array_object.socket_id == session.sessionId) {
        //                 instruction.socket_id = session.sessionId;
        //                 socket.broadcast.to('game:scene:instance:' + instance_obj.scene_id.toString()).emit('load_object', instruction);
        //             }
        //             console.log(modules.controllers.game.scene.instance.collection[0].objects.ships.length)
        //             if (session.sessionId == socket.id) {

        //             }

        //         });
        //     }

        //     socket.emit('load_object', instruction);


        // };

    }

    add_player = function (socket, user, instance_obj) {
        // Defaulting to first character and ship for now... this will have it's own mechanisms later

        this.client_sessions.push({
            user: user,
            sessionId: socket.id,
            mode: instance_obj.environment == 'indoor' ? 'character' : 'ship',
            socket: socket,
            instance_id: instance_obj.scene_id, // note: this is not the scene ID
            username: user.username
        });

        if (instance_obj.environment == 'indoor') {
            // modules.models.game.objects.characters.model.find({ _id: user.characters[0].object_id }, function (err, characters) {
            //     characters[0].position.x = user.position.x;
            //     characters[0].position.y = user.position.y;
            //     characters[0].position.z = user.position.z;

            //     characters[0].rotation.x = user.rotation.x;
            //     characters[0].rotation.y = user.rotation.y;
            //     characters[0].rotation.z = user.rotation.z;

            //     instance_obj.objects.characters.push(characters[0]);

            //     this.client_setup(user, socket, instance_obj);
            // });
        }
        else {

            // @todo: Look up ship type.
            let ship = new Valiant();
            ship.socket_id = socket.id;
            ship.username = user.username;

            instance_obj.objects.ships.push(ship);
            this.client_setup(user, socket, instance_obj);
        
        }
    }

    remove_player = (socket) => {
        this.client_sessions.forEach( (session, session_index) => {
            if (session.sessionId == socket.id) {
                this.active_scenes.forEach((instance_obj) => {

                    if (instance_obj.scene_id.toString() == session.instance_id.toString()) {
                        socket.broadcast.to('game:scene:instance:' + instance_obj.scene_id.toString()).emit('logout', { socket_id: socket.id });
                        this.client_sessions.splice(session_index, 1);
                        if (session.mode == 'character') {
                            instance_obj.objects.characters.forEach(function (character, character_index) {
                                if (character.socket_id == session.sessionId) {
                                    instance_obj.objects.characters.splice(character_index, 1);
                                }
                            });
                        }
                        if (session.mode == 'ship') {
                            instance_obj.objects.ships.forEach(function (ship, ship_index) {
                                if (ship.socket_id == session.sessionId) {
                                    instance_obj.objects.ships.splice(ship_index, 1);
                                }
                            });
                        }

                    }
                });
            }

        });

    }

    input = function (socket, data) {
        this.client_sessions.forEach( (session) => {
            if (session.sessionId == socket.id) {
                this.active_scenes.forEach( (instance_obj) => {
                    if (instance_obj.scene_id.toString() == session.instance_id.toString()) {
                        if (session.mode == 'ship') {
                            instance_obj.objects.ships.forEach(function (ship) {
                                if (ship.socket_id == session.sessionId) {
                                    ship.controls = data;
                                    // instance_obj.update_queue.push({
                                    //     object: ship,
                                    //     _id: session.user._id,
                                    //     socket_id: socket.id,
                                    //     obj_class: "ships",
                                    //     type: "move_ship",
                                    //     details: data,
                                    //     username: session.user.username
                                    // });
                                }
                            });

                        }
                    }
                });
            }
        });

    };

    subscribe = function (socket, instance_obj) {        
   
        // join the socket to the room
        // send the load scene instructions

        socket.join('game:scene:instance:' + instance_obj.scene_id.toString());

        this.add_player(socket, { user: socket.id, username: 'New Player' }, instance_obj)

        console.log(this.client_sessions);

    };

    create = function (scene, callback) {
        let newActiveScene = modules.merge(
            this.default_scene_settings,
            {
                scene_id: scene._id,
                name: scene.name,
                description: scene.description,
                environment: scene.environment,
                last_epoch: new Date().getTime(),
                delta: 0,
                interval_ticks: 0,
                transmit_interval: 1
            }
        )

        this.active_scenes.push( newActiveScene );

        callback( this.active_scenes.length - 1 );

    };
};
