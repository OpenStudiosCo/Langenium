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
	if (window.location.href.indexOf("dev.langenium") >= 0)
	{
		return "http://dev.langenium.com:8080"; // own port "8080"
		
	}
	else {
		return "http://langenium.com:8080";
	}
}
events.prototype.setEventHandlers = function (socket) {
	var is_editor = false;
	if (window.location.href.indexOf("editor") > 0) { is_editor = true; }

    socket.emit("login", { username: "Saggy Nuts", editor: is_editor });
	socket.on("load", function(data) { 
		objects.loadObject(data);
	});

	socket.on("login", function(data) { 
		events.login(data);
	});

	socket.on("logout",function(data) {
		ships.forEach(function(ship, index){
			if (data.socket_id == ship.socket_id) {
				events.logout(ship, index);
			}
		});
	});
	socket.on("update", function(updates){
		updates.forEach(function(update){
			if (update.type == "move") {
				if (update.obj_class == "players") {
					ships.forEach(function(ship){
						if (update.socket_id == ship.socket_id) {
							events.moveShip(ship, true, { name: "move", type: "player", details: update });
						}
					});
				}
			}
		});
		
	});
	return socket;
}

events.prototype.login = function(user) {
	if (window.location.href.indexOf("editor") >= 0) {
		$('.username_menu > .button').html('');
		$('.username_menu > .button').append('<img src="https://graph.facebook.com/'+user.facebook_id+'/picture?width=20&height=20" />'); 
		$('.username_menu > .button').append(user.username); 
		$('.username_menu .login').remove();

		var html = '<li>';
		html += '<a href="/logout" target="_new">';
		html += '<i class="icon-power-off" /> Logout</a>';
		html += '</li>'

		$('.username_menu menu ul').append(html);

	}
}

events.prototype.detectCollision = function (source, direction, world_map) {
	var raycaster = new THREE.Raycaster(source, direction.normalize());
	var intersects = raycaster.intersectObjects(world_map);
	return intersects;
}

events.prototype.logout = function(ship, index) {
	teleportEffect(ship.position);
	scene.remove(ship);
	ships.splice(index, 1);
}

events.prototype.moveShip = function (ship, isPlayer, instruction) {

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
			ship.rotation.z += rotate / 4;
		}
		else {
			ship.rotation.z += rotate / 5;
		}
		ship.rotation.y = instruction.details.rY;
	}
	if (rotate < 0) {
		if (ship.rotation.z > -.5) {
			ship.rotation.z += rotate / 4;
		}
		else {
			ship.rotation.z += rotate / 5;
		}
		ship.rotation.y = instruction.details.rY;
	}

}