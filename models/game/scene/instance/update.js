/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Update
	This is the model that defines the models for the game's scene instance updates


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var update = {};

	update.schema = new modules.mongoose.Schema ({
		object: {},
		_id: modules.mongoose.Schema.Types.ObjectId,
		socket_id: String,
		obj_class: String,
		type: String,
		details: {},
		username: String
	});

	update.model = modules.mongoose.model('instance_updates', update.schema);
	
	return update;
}