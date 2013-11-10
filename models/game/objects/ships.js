/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Ships
	This is the model that defines the models for the game's ship objects


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var ships = {};

	ships.schema = new modules.mongoose.Schema ({
		category: String,
		input_status: Boolean,
		socket_id: String,
		username: String,
		details: {
			object_id: modules.mongoose.Schema.Types.ObjectId,
			name: String,
			sub_type: String,
			type: { type: String }
		},
		velocity: Number,
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
	
	ships.model = modules.mongoose.model('ships', ships.schema);

	return ships;
}