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
   	this.latency = new TimeSeries();
	this.chart = new SmoothieChart();
	
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
    
	socket.on("load_scene", function(data) { 
		console.log("load_scene");
		scenes.load(data);
		engine.animate();
	});

	socket.on("load_object", function(data) { 
		console.log("load_object");
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
	socket.on("ping", function(data){
		if (player) {
			player.latency = data.latency;
		}
		events.latency.append(new Date().getTime(), data.latency);
		$("#latencyLabel").html("<h3>&nbsp;" + data.latency + "ms</h3>");
		socket.emit("pong", data);
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
				//console.log(update);
				if (update.socket_id == player.socket_id) {
					if (update.details.object.type == "characters" && controls.character.enabled == false) {
						objects.characters.make(update.socket_id, objects.characters[update.details.object.name], player.position);
						client.camera = controls.character.camera;
						controls.character.enabled = true;
					}
					if (update.details.object.type == "ships" && controls.flight.enabled == false) {
						objects.characters.remove(update.socket_id);
						client.camera = controls.flight.camera;
						controls.flight.enabled = true;
					}
				}
				else {
					objects.ships.collection.forEach(function(ship){
						if (ship.socket_id == update.socket_id) {
							if (update.details.object.type == "characters") {
								objects.characters.make(update.socket_id, objects.characters[update.details.object.name], ship.position);
							}
							if (update.details.object.type == "ships") {
								objects.characters.remove(update.socket_id);
							}
						}
						
						
					});
				}
			} 
		});
		
	});
	return socket;
}



// This is for authentication
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
	effects.particles.teleportEffect(ship.position);
	scene.remove(ship);
	objects.ships.collection.splice(index, 1);
}
