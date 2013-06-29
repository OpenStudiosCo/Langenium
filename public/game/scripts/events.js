/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Events
	This defines the client event handlers
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var events = function() {
    this.socket = this.setEventHandlers(
            io.connect(this.getUrl())
        );
    return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
events.prototype.getUrl = function () {
	if (window.location.href.indexOf("langenium") > 0)
	{
		return "http://langenium.com:8080"; // own port "8080"
		
	}
	else {
		return "http://localhost:8000";
	}
}
events.prototype.setEventHandlers = function (socket) {
    socket.emit("login", { username: "Saggy Nuts" });
	socket.on("load", function(data) { 
		objects.loadObject(data);
	});
	return socket;
}

events.prototype.detectCollision = function (source, direction, world_map) {
	var raycaster = new THREE.Raycaster(source, direction.normalize());
	var intersects = raycaster.intersectObjects(world_map);
	return intersects;
}

events.prototype.moveShip = function (ship, isPlayer, instruction) {

	var playerMesh = player;
	
	
	
	if (instruction.details.pY != 0){
		ship.position.y = instruction.details.pY;
	}
	
	if (instruction.details.pX != 0){
		ship.position.x = instruction.details.pX;

	}
	
	if (instruction.details.pZ != 0) {
		ship.position.z = instruction.details.pZ;

	}
	
	var rotate = instruction.details.rY - ship.rotation.y;
	
	if (rotate > 0){
		if (ship.rotation.z < .5) {
			ship.rotation.z += rotate / 3;
		}
		else {
			ship.rotation.z += rotate / 4;
		}
		ship.rotation.y = instruction.details.rY;
	}
	if (rotate < 0) {
		if (ship.rotation.z > -.5) {
			ship.rotation.z += rotate / 3;
		}
		else {
			ship.rotation.z += rotate / 4;
		}
		ship.rotation.y = instruction.details.rY;
	}

}