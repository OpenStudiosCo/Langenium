/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Instance
	This class defines the instance object which provides a container

	An instance is a scene in the game. The primary instance is the 'master' which contains the overworld. 

	The child_id of an instance defines what is spawned. Child types and the container type share the same folder /types
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Exports Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

module.exports.make = make;


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Global Variables
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/* Instance Types */
var 	types = {
					container: require("./instance/types/container.js"),
					outdoor: require("./instance/types/outdoor.js"),
					indoor: require("./instance/types/indoor.js")
};
		
/* Object Definitions */
var 	objects = {
					players: require("./instance/objects/players.js"),
					bots: require("./instance/objects/bots.js"),
					projectiles: require("./instance/objects/projectiles.js"),
					environment: require("./instance/objects/environment.js"),
					ships: require("./instance/objects/ships.js"),
					characters: require("./instance/objects/characters.js")
};
		
		
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

function make(io, type, THREE, db) {
	/* 
		Creates a new instance
		
		Parameters:
			io 		provider to socket.io
			type 	defines which instance class type to make
			THREE	provider to THREE.JS
			db 		provider to database module
	*/
	var instance = {};
	
	// Containers contain clocks and handle 'chambers' or 'worlds'
	if (type == "container") { 
		instance.addObjectToContainer = function(details) { addObjectToContainer(details, instance, THREE, db) };
		return types.container.make(instance); 
	}
	
	// The child types below are individual worlds
	if (type == "outdoor") { 
		return types.outdoor.make(io, instance, objects); 
	}
	
	if (type == "indoor") { 
		return types.indoor.make(io, instance, objects); 
	}
}

function addObjectToContainer(details, container, THREE, db) {
	/* 
		Adds an object 
		
		Parameters:
			io 		provider to socket.io
			type 	defines which instance class type to make
			THREE	provider to THREE.JS
			db 		provider to database module
	*/
	container.instances[0][details.class].push( objects[details.class].make(details, THREE) ); // defaults to world 0 for now

}
