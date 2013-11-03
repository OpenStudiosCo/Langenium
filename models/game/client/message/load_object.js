/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Load Object
	This is the model that defines the models for the load_object message


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

module.exports= function(modules) {
	var load_object = {};

	load_object.schema = new modules.mongoose.Schema({
		_id: modules.mongoose.Schema.Types.ObjectId,
		socket_id: String,
		category: String,
		url: String,
		status: String,
		details: {
			object_id: modules.mongoose.Schema.Types.ObjectId,
			name: String,
			type: { type: String },
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
		}
	});

	load_object.model = modules.mongoose.model('load_object', load_object.schema);

	return load_object;
}