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
		objects.ships.collection.forEach(function(ship, index){
			if (ship.socket_id && data.socket_id == ship.socket_id) {
				events.logout(ship, index);
			}
		});
	});
	socket.on("update", function(updates){

		updates.forEach(function(update){

			if (update.type == "move_ship") {
				
				if (player && update.socket_id == player.socket_id) {
					player.move(player, true, update);
				}
				else {
					objects.ships.collection.forEach(function(ship){
						if (ship.socket_id && update.socket_id == ship.socket_id) {
							ship.move(ship, false, update);
						}
						if (ship.bot_id && update.bot_id == ship.bot_id) {
							ship.move(ship, false, update);
						}
					});
				}
				
			}

			if (update.type == "move_character") {
				controls.character.move(update.details);
				
			}

			if (update.type == "character_toggle") {
				
				objects.ships.collection.forEach(function(ship){
					if (update.socket_id != player.socket_id) {
						if (ship.socket_id == update.socket_id) {
							if (update.details.object.type == "characters") {
								objects.characters.make(update.socket_id, objects.characters[update.details.object.name], ship.position);
							}
							if (update.details.object.type == "ships") {
								objects.characters.remove(update.socket_id);
							}
						}
					}
					if (update.socket_id == player.socket_id) {
						
						if (update.details.object.type == "characters" && controls.character.enabled == false) {

							objects.characters.make(update.socket_id, objects.characters[update.details.object.name], ship.position);
							client.camera = controls.character.camera;
							controls.character.enabled = true;
						}
						if (update.details.object.type == "ships" && controls.flight.enabled == false) {
							objects.characters.remove(update.socket_id);
							client.camera = controls.flight.camera;
							controls.flight.enabled = true;
						}
					}
				});
				
			} 
		});
		
	});
	return socket;
}

events.prototype.login = function(user) {
	
	if (window.location.href.indexOf("editor") >= 0) {
		$('.username_menu > .button').html('');
		$('.username_menu > .button').append('<img src="https://graph.facebook.com/'+user.facebook_id+'/picture?width=20&height=20" /> '); 
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
