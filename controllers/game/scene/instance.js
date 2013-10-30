/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Instance
	This is the controller that defines the functionality for the game's scene instances


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var instance = {};

	instance.collection = [];

	instance.input = function(socket, modules, data) {

	}

	instance.subscribe = function(socket, modules, data) {
		console.log(data);
	}

	instance.create = function(scene) {
		var newInstance = new modules.models.game.scene.instance.model({
			scene_id: scene._id,
			name: scene.name,
			description: scene.description,
			environment: scene.environment,
			objects: {
				bots: [],
				characters: [],
				environment: [],
				ships: []
			}
		});
		instance.collection.push(newInstance);
	}

	return instance;
}