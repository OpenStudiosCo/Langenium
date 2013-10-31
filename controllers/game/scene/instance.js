/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Instance
	This is the controller that defines the functionality for the game's scene instances


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var instance = {};

	instance.collection = [];

	instance.input = function(socket, modules, data) {

	};

	instance.subscribe = function(socket, modules, data) {
		console.log(data);
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
			callback();
		});
	};
	
	return instance;
}