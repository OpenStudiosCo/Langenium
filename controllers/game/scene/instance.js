/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Instance
	This is the controller that defines the functionality for the game's scene instances


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var instance = {};

	// user for cross navigation of instances
	instance.collection = [];

	// used for cross navigation of clients
	instance.client_sessions = [];

	instance.update = function(instance_obj) {
		// Proces the obj delta
		var new_time = new Date().getTime();
		instance_obj.delta = (new_time - instance_obj.last_time);
		instance_obj.last_time = new_time;

		// Process enqueued scene updates
		var processed_changes = [];

		instance_obj.update_queue.forEach(function(update, index){

			var _complete = function(processed_change) {
				processed_changes.push(processed_change);
				instance_obj.update_queue.splice(index, 1);
			
			};
			if (update.type == 'move_ship') {
				update.object.input_status = true;
			}
			modules.controllers.game.objects[update.obj_class][update.type](instance_obj.delta, update, _complete)

		});

		if (instance_obj.interval_ticks >= instance_obj.transmit_interval) {
			instance_obj.interval_ticks = 0;
			instance_obj.objects.ships.forEach(function(ship){
				if (ship.input_status == false) {
					var _complete = function(processed_change) {
						processed_changes.push(processed_change);
					};
					ship.velocity *= .996;
					var update = new modules.models.game.scene.instance.update.model({
							object: ship,
							socket_id: ship.socket_id,
							type: "move_ship",
							username: ship.username,
							obj_class: 'ships',
							details: {
								d: instance_obj.delta / 10000,
								pZ: 0,
								pY: 0,
								rY: 0,
								fire: false	
							}
						});
					modules.controllers.game.objects.ships.move_ship(
						instance_obj.delta / 10000,
						update,
						_complete
					);
				}
				else {
					ship.input_status = false;
				}
			});
		}
		else {
			instance_obj.interval_ticks++;
		}
		modules.io.sockets.in('game:scene:instance:'+instance_obj.scene_id.toString()).emit('update', processed_changes);
		//modules.io.sockets.in('game:scene:instance:'+instance_obj.scene_id.toString()).emit('admin:dashboard:server_stats:update', server_stats.get_data());
	};

	instance.client_setup = function(user, socket, instance_obj) {
		socket.emit('load_scene', instance_obj);

		var sprite_callback = function(instance_sprite, sprites) {
			console.log(sprites);
		};

		var mesh_callback = function(instance_array_object, objects) {
			var instruction = modules.models.game.client.message.load_object.model({
				_id: instance_array_object._id,
				category: instance_array_object.category,
				url: objects[0].details.url,
				status: 'Saved',
				details: {
					object_id: objects[0]._id,
					name: objects[0].name,
					type: objects[0].type,
					sub_type: objects[0].sub_type
				},
				position: {
					x: instance_array_object.category == 'ships' ? user.position.x : instance_array_object.position.x,
					y: instance_array_object.category == 'ships' ? user.position.y : instance_array_object.position.y,
					z: instance_array_object.category == 'ships' ? user.position.z : instance_array_object.position.z
				},
				rotation: {
					x: instance_array_object.category == 'ships' ? user.rotation.x : instance_array_object.rotation.x,
					y: instance_array_object.category == 'ships' ? user.rotation.y : instance_array_object.rotation.y,
					z: instance_array_object.category == 'ships' ? user.rotation.z : instance_array_object.rotation.z,
				},
				scale: {
					x: instance_array_object.scale ? instance_array_object.scale.x : objects[0].details.scale.x,
					y: instance_array_object.scale ? instance_array_object.scale.y : objects[0].details.scale.y,
					z: instance_array_object.scale ? instance_array_object.scale.z : objects[0].details.scale.z
				}
			});		

			if (instance_array_object.category == 'ships') {
				instance.client_sessions.forEach(function(session, index){
					if (instance_array_object.socket_id == session.sessionId) {
						instruction.socket_id = session.sessionId;
						socket.broadcast.to('game:scene:instance:'+instance_obj.scene_id.toString()).emit('load_object', instruction);
					}
					console.log(modules.controllers.game.scene.instance.collection[0].objects.ships.length)
					if (session.sessionId == socket.id){
						
					}

				});
			}
		
			socket.emit('load_object', instruction);
			

		}; 

		var looper = function(model, obj_array, callback) {
			obj_array.forEach(function(instance_array_object, index) {
				model.find({ _id: instance_array_object.details.object_id }, function(err, obj_results) {
					callback(instance_array_object, obj_results)
				});
			});
		}

		looper(modules.models.game.objects.characters.model, instance_obj.objects.characters, sprite_callback);
		looper(modules.models.game.objects.model, instance_obj.objects.environment, mesh_callback);
		looper(modules.models.game.objects.model, instance_obj.objects.ships, mesh_callback);
		
	}

	instance.add_player = function(socket, user, instance_obj) {
		// Defaulting to first character and ship for now... this will have it's own mechanisms later

		instance.client_sessions.push(new modules.models.user.session.model({
			user: user,
			sessionId: socket.id,
			mode: instance_obj.environment == 'indoor' ? 'character' : 'ship',
			socket: socket,
			instance_id: instance_obj._id, // note: this is not the scene ID
			username: user.username
		}));
		
		if (instance_obj.environment == 'indoor') {
			modules.models.game.objects.characters.model.find({ _id: user.characters[0].object_id }, function(err, characters) {
				characters[0].position.x = user.position.x;
				characters[0].position.y = user.position.y;
				characters[0].position.z = user.position.z;

				characters[0].rotation.x = user.rotation.x;
				characters[0].rotation.y = user.rotation.y;
				characters[0].rotation.z = user.rotation.z;

				instance_obj.objects.characters.push(characters[0]);

				instance.client_setup(user, socket, instance_obj);
			});
		}
		else {
			modules.models.game.objects.ships.model.find({ _id: user.ships[0].object_id }, function(err, ships) {
				ships[0].position.x = user.position.x;
				ships[0].position.y = user.position.y;
				ships[0].position.z = user.position.z;

				ships[0].rotation.x = user.rotation.x;
				ships[0].rotation.y = user.rotation.y;
				ships[0].rotation.z = user.rotation.z;

				ships[0].velocity = 0;
				ships[0].input_status = false;
				ships[0].socket_id = socket.id;
				ships[0].username = user.username;

				instance_obj.objects.ships.push(ships[0]);
				instance.client_setup(user, socket, instance_obj);				
			});
		}
	}

	instance.remove_player = function(socket) {
		instance.client_sessions.forEach(function(session, session_index){
			if (session.sessionId == socket.id) {
				instance.collection.forEach(function(instance_obj) {
					if (instance_obj._id.toString() == session.instance_id.toString()) {	
						socket.broadcast.to('game:scene:instance:'+instance_obj.scene_id.toString()).emit('logout', { socket_id: socket.id });
						instance.client_sessions.splice(session_index, 1);
						if (session.mode =='character') {
							instance_obj.objects.characters.forEach(function(character, character_index){
								if (character.socket_id == session.sessionId){
									instance_obj.objects.characters.splice(character_index, 1);
								}
							});
						}
						if (session.mode =='ship') {
							instance_obj.objects.ships.forEach(function(ship, ship_index){
								if (ship.socket_id == session.sessionId){
									instance_obj.objects.ships.splice(ship_index, 1);
								}
							});
						}
						
					}
				});
			}
			
		});

	}

	instance.input = function(socket, data) {
		instance.client_sessions.forEach(function(session){
			if (session.sessionId == socket.id) {
				instance.collection.forEach(function(instance_obj){
					if (instance_obj._id.toString() == session.instance_id.toString()) {
						if (session.mode == 'ship') {
							instance_obj.objects.ships.forEach(function(ship){
								if (ship.socket_id == session.sessionId) {
									instance_obj.update_queue.push(new modules.models.game.scene.instance.update.model({
										object: ship,
										_id: session.user._id,
										socket_id: socket.id,
										obj_class: "ships",
										type: "move_ship",
										details: data,
										username: session.user.username
									}));
								}
							});

						}	
					}
				});
			}
		});
	
	};

	instance.subscribe = function(socket, data) {
		// we are taking in the username and editor variables
		modules.models.user.model.find({username: data.username}, function(err, users) {
			var instance_found = false;
			modules.controllers.game.scene.instance.collection.forEach(function(instance_obj, index){	
				if (instance_obj.scene_id.toString() == users[0].scene_id.toString()) {
					// join the socket to the room
					// send the load scene instructions
					
					socket.join('game:scene:instance:'+instance_obj.scene_id.toString());

					instance.add_player(socket, users[0], instance_obj)
					instance_found = true;

				}
			});
			// This is incomplete, so far just boots up the instance... will look at this when working on scene director
			if (instance_found == false) {
				modules.models.game.scene.model.find({_id: users[0].scene_id}, function(err, scenes) {
					modules.controllers.game.scene.instance.create(scenes[0], function(index) {
						modules.add_clock(instance.collection[index], instance.update);
						console.log(modules.controllers.game.scene.instance.collection[index])
					});
				})
				
			}
			
		})
		//console.log(data);
	};

	instance.create = function(scene, callback) {
		var newInstance = new modules.models.game.scene.instance.model({
			scene_id: scene._id,
			name: scene.name,
			description: scene.description,
			environment: scene.environment,
			last_epoch: new Date().getTime(),
			delta: 0,
			interval_ticks: 0,
			transmit_interval: 1
		});

		modules.models.game.scene.objects.model.find({ scene_id: newInstance.scene_id }, function(err, scene_objects) {
			scene_objects.forEach(function(object,index) {
				// add the object to the instance's relevant object array
				newInstance.objects[object.category].push(object);
			});	
			instance.collection.push(newInstance);
			callback(instance.collection.length-1);
		});
	};
	
	return instance;
}