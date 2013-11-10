/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Characters
	This is the model that defines the models for the game's character objects


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var characters = {};

	characters.schema = new modules.mongoose.Schema ({
		category: String,
		input_status: Boolean,
		name: String,
		type: String,
		user_id: modules.mongoose.Schema.Types.ObjectId,
		position: {
			x: Number,
			y: Number,
			z: Number
		},
		rotation: {
			x: Number,
			y: Number,
			z: Number
		}
	});
	
	characters.model = modules.mongoose.model('characters', characters.schema);

	return characters;
}