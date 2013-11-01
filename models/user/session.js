/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Session
	This is the model that defines the models for user sessions


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var session = {};

	session.schema = new modules.mongoose.Schema({
		user_id: modules.mongoose.Schema.Types.ObjectId,
		sessionId: String,
		mode: String,
		socket: Object,
		instance_id: modules.mongoose.Schema.Types.ObjectId,
		username: String
	});

	session.model = modules.mongoose.model('client_sessions', session.schema);

	return session;
}