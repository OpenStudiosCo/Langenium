/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	User
	This is the model that defines the models for users


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var user = {};
	user.session = require('./user/session.js')(modules);
	user.schema = new modules.mongoose.Schema ({
		username: String,
		scene_id: modules.mongoose.Schema.Types.ObjectId, 
		position: {
			x: Number,
			y: Number,
			z: Number
		},
		characters: [{
			object_id:  modules.mongoose.Schema.Types.ObjectId
		}],
		ships: [{
			object_id: modules.mongoose.Schema.Types.ObjectId
		}],
	});
	user.model = modules.mongoose.model('users', user.schema);

	return user;
}