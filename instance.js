/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Instance
	This class defines the instance object which provides a container
	
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
					container: require("./types/container.js"),
					world: require("./types/world.js"),
};
		
/* Object Definitions */
var 	objects = {
					players: require("./objects/players.js"),
					bots: require("./objects/bots.js"),
					projectiles: require("./objects/projectiles.js"),
					environment: require("./objects/environment.js"),
					ships: require("./objects/ships.js"),
					characters: require("./objects/characters.js")
};
		
		
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

function make(io, type, THREE, db) {
	/* 
		Creates a new instance
		
		Parameters:
			type - defines which instance class type to make
	*/
	var instance = {};
	
	if (type == "container") { 

		instance.addObjectToContainer = function(details) { addObjectToContainer(details, instance, THREE, db) };
		return types.container.make(instance); 
	}
	
	if (type == "world") { 
		instance.addObjectToWorld = function(details) { addObjectToWorld(details, instance, THREE, db) };
		return types.world.make(io, instance, objects); 
	}

}

function addObjectToContainer(details, container, THREE, db) {
	var callback = function(result) {
		console.log("----------------------------------------------------------------------");
		console.log(details);
		console.log(result);
		result.forEach(function(obj){
			var scale = details.scale ? details.scale : obj.details.scale;
			var loader =  new THREE.JSONLoader();
			loader.load(obj.details.url, function(geometry, materials){
				var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
				mesh.geometry.computeBoundingBox();
				mesh.scale = new THREE.Vector3(scale,scale,scale);
				mesh.position.x = details.position.x;
				mesh.position.y = details.position.y;
				mesh.position.z = details.position.z;
				mesh.matrixAutoUpdate = true;
				mesh.updateMatrix();
				mesh.updateMatrixWorld();

				details.obj_mesh = mesh;
				
				
			});	
		});
			
	};
	container.instances[0][details.class].push( objects[details.class].make(details, THREE) ); // defaults to world 0 for now

	//db.queryClientDB("objects", {type: details.object.type, sub_type: details.object.sub_type, name: details.object.name}, callback);
}

function addObjectToWorld(details, world, THREE, db) {
	world[details.type].push(objects[details.type].make());
}

