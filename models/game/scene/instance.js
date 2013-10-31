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
		last_time: Number,
		delta: Number,
		objects: {
			bots: [],
			characters: [],
			environment: [],
			ships: []
		},
		update_queue: []
	});
	
	instance.schema.methods.update = function(instance_obj) {
		// do some stuff with my objects
		var new_time = new Date().getTime();
		instance_obj.delta = (new_time - instance_obj.last_time);
		instance_obj.last_time = new_time;
		//console.log(instance_obj);
	};

	instance.model = modules.mongoose.model('instances', instance.schema);
	
	return instance;
}