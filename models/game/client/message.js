/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Message
	This is the model that defines the models for the game's client messages


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

module.exports= function(modules) {
	var message = {};

	message.load_character = require('./message/load_character.js')(modules);
	message.load_object = require('./message/load_object.js')(modules);
	message.load_scene = require('./message/load_scene.js')(modules);
	message.update = require('./message/update.js')(modules);

	message.login = require('./message/login.js')(modules);
	message.logout = require('./message/logout.js')(modules);

	return message;
}