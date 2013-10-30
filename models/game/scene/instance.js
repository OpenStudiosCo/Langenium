/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Instance
	This is the model that defines the models for the game's scene instances


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var instance = {};

	instance.schema = new modules.mongoose.Schema ({
		scene_id: modules.mongoose.Schema.Types.ObjectId,
		name: String,
		description: String,
		environment: String,
		startup: String,
		objects: {
			bots: [],
			characters: [],
			environment: [],
			ships: []
		}
	});

	instance.schema.methods.create_clock = function(callback, instance_obj) {
		return setInterval( function(){ callback(instance_obj); }, 1000 / 66);
	}

	instance.schema.methods.update = function(obj) {
		// do some stuff with my objects
		console.log(obj);
	};

	instance.model = modules.mongoose.model('instances', instance.schema);
	
	return instance;
}