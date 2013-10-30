/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Objects
	This is the model that defines the models for the game's objects


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var objects = {};
	objects.bots = require('./objects/bots.js')(modules);
	objects.characters = require('./objects/characters.js')(modules);
	objects.environment = require('./objects/environment.js')(modules);
	objects.ships = require('./objects/ships.js')(modules);

	objects.schema = new modules.mongoose.Schema ({
		details: {
			url: String,
			scale: {
				x: Number,
				y: Number,
				z: Number
			}
		},
		name: String,
		sub_type: String,
		type: String
	});
	
	objects.model = modules.mongoose.model('objects', objects.schema);

	return objects;
}