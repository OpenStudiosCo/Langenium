/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Objects
	This is the model that defines the models for the game's objects


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var instance = {};

	instance.subscribe = function(req) {
		// Add user to scene as either character or ship, 
	}

	instance.input = function(req) {
		// Switch between character and ship type of input 
	}

	instance.update = function(req) {
		// Send an update of the game state
	}

	return instance;
}