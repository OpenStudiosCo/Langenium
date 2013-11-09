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
		// do some stuff with my objects
		var new_time = new Date().getTime();
		instance_obj.delta = (new_time - instance_obj.last_time);
		instance_obj.last_time = new_time;
		//modules.io.sockets.in('game:scene:instance:'+instance_obj.scene_id.toString()).emit('admin:dashboard:server_stats:update', server_stats.get_data());
	};

	instance.client_setup = function(user, socket, instance_obj) {
		socket.emit('load_scene', instance_obj);

		var sprite_callback = function(instance_sprite, sprites) {
			console.log(sprites);
		};

		var mesh_callback = function(instance_mesh, objects) {
			var instruction = modules.models.game.client.message.load_object.model({
				_id: instance_mesh._id,
				category: instance_mesh.category,
				url: objects[0].details.url,
				status: 'Saved',
				details: {
					object_id: objects[0]._id,
					name: objects[0].name,
					type: objects[0].type,
					sub_type: objects[0].sub_type
				},
				position: {
					x: instance_mesh.category == 'ships' ? user.position.x : instance_mesh.position.x,
					y: instance_mesh.category == 'ships' ? user.position.y : instance_mesh.position.y,
					z: instance_mesh.category == 'ships' ? user.position.z : instance_mesh.position.z
				},
				rotation: {
					x: instance_mesh.category == 'ships' ? user.rotation.x : instance_mesh.rotation.x,
					y: instance_mesh.category == 'ships' ? user.rotation.y : instance_mesh.rotation.y,
					z: instance_mesh.category == 'ships' ? user.rotation.z : instance_mesh.rotation.z,
				},
				scale: {
					x: instance_mesh.scale ? instance_mesh.scale.x : objects[0].details.scale.x,
					y: instance_mesh.scale ? instance_mesh.scale.y : objects[0].details.scale.y,
					z: instance_mesh.scale ? instance_mesh.scale.z : objects[0].details.scale.z
				}
			});		

			if (instance_mesh.category == 'ships') {
				instance.client_sessions.forEach(function(session, index){
					if (session.user_id.toString() == instance_mesh.user_id.toString()) {
						instruction.socket_id = session.sessionId;
					}
				});
			}
			socket.emit('load_object', instruction);
		}; 

		var looper = function(model, obj_array, callback) {
			obj_array.forEach(function(instance_object, index) {
				model.find({ _id: instance_object.details.object_id }, function(err, obj_results) {
					callback(instance_object, obj_results)
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
			user_id: user._id,
			sessionId: socket.id,
			mode: instance_obj.environment == 'indoor' ? 'character' : 'ship',
			socket: socket,
			instance_id: instance_obj._id, // note: this is not the scene ID
			username: user.username
		}));
		
		if (instance_obj.environment == 'indoor') {
			modules.models.game.objects.characters.model.find({ _id: user.characters[0].object_id }, function(err, characters) {
				instance_obj.objects.characters.push(v[0]);
				instance.client_setup(user, socket, instance_obj);
			});
		}
		else {
			modules.models.game.objects.ships.model.find({ _id: user.ships[0].object_id }, function(err, ships) {
				instance_obj.objects.ships.push(ships[0]);
				instance.client_setup(user, socket, instance_obj);				
			});
		}
	}

	instance.input = function(socket, data) {
		instance.client_sessions.forEach(function(session){
			if (session.sessionId == socket.id) {
				instance.collection.forEach(function(instance_obj){
					if (instance_obj._id.toString() == session.instance_id.toString()) {
						if (session.mode == 'ship') {
							instance_obj.objects.ships.forEach(function(ship){
								if (ship.user_id.toString() == session.user_id.toString()) {
									console.log(ship)
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
			delta: 0
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