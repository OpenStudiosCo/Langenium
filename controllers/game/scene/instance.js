/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Instance
	This is the controller that defines the functionality for the game's scene instances


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var instance = {};

	instance.collection = [];

	instance.update = function(instance_obj) {
		// do some stuff with my objects
		var new_time = new Date().getTime();
		instance_obj.delta = (new_time - instance_obj.last_time);
		instance_obj.last_time = new_time;
		//modules.io.sockets.in('game:scene:instance:'+instance_obj.scene_id.toString()).emit('admin:dashboard:server_stats:update', server_stats.get_data());
	};

	instance.client_setup = function(socket, instance_obj) {
		socket.emit('load_scene', instance_obj);

		var object_types = ['bots','characters','environment','ships'];
		for (var i in object_types) {
			console.log(instance_obj.objects[object_types[i]]);
		}
		
	}

	instance.input = function(socket, data) {

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
					instance.client_setup(socket, instance_obj)
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