/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Objects
	This is the model that defines the models for the scene's objects


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var objects = {};

	objects.schema = new modules.mongoose.Schema ({
		category: String,
		scene_id: modules.mongoose.Schema.Types.ObjectId,
		details: {
			_id: modules.mongoose.Schema.Types.ObjectId,
			name: String,
			type: String,
			sub_type: String
		},
		position: {
			x: Number,
			y: Number,
			z: Number
		},
		rotation: {
			x: Number,
			y: Number,
			z: Number
		},
		scale: {
			x: Number,
			y: Number,
			z: Number
		},
		startup: String
	});
	objects.model = modules.mongoose.model('scene_objects', objects.schema);
	
	return objects;
}