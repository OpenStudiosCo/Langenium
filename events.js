/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Events
		This class parses socket inputs into various functions
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Exports Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

module.exports.login = login;
module.exports.logout = logout;
module.exports.pong = pong;
module.exports.move_ship = move_ship;
module.exports.character_toggle = character_toggle;


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Global Variables
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

function login(socket, data, db, instances, client_sessions) {
	/* 
		Returns the standard container type instance object
		
		Parameters:
			none
	*/
	
	if (data.username.length > 0) {
		var loginUser = function(result) { 
		
			var player = result[0];
			player.editor = data.editor;
			player.velocity = 0;
			player.socket_id = socket.id;
			player.input_status = false;

			// for now, we are defaulting to Mercenary ships
			player.object = {
				_id: "51dee691fc48c32330000000",
				name: "mercenary",
				type: "ship",
				sub_type: "winthrom"
			};

			// check if we're dealing with a container
			if (instances[player.instance_id].instances) {

				instances[player.instance_id].addObjectToContainer(player, instances[player.instance_id].instances[0].players);
				initializeClient(socket, instances[player.instance_id].instances[0], db);
			}
			else {
				instances[player.instance_id].addObjectToWorld(player, instances[player.instance_id].players);
				initializeClient(socket, instances[player.instance_id], db);
			}
			
			client_sessions.push({					_id: player._id,
													sessionId: socket.id,
													mode: "ship",
													socket: socket,
													instance_id: player.instance_id,
													username: player.username });
		
		};
		
		db.queryClientDB("players", { username: data.username }, loginUser);
	
	}
										
}

function logout(socket, db, instances, client_sessions) {

	client_sessions.forEach(function(client, index){
		if (client.sessionId == socket.id) {
			socket.broadcast.emit('logout', { socket_id: socket.id }); // change to sessionID later

			instances[client_sessions[index].instance_id].instances[0].players.forEach(function(player, player_index) {
				if (socket.id == player.socket_id) {
					instances[client_sessions[index].instance_id].instances[0].players.splice(player_index, 1);
				}
			});
			
			client_sessions.splice(index, 1);
			delete socket;
		}			
	});
}

function move_ship(socket, data, db, instances, client_sessions) {
	//console.log(instances.master.instances[0].environment);
	client_sessions.forEach(function(client, index){
		if (client.sessionId == socket.id) {
			var update = {
				_id: client._id,
				socket_id: socket.id,
				obj_class: "players",
				type: "move_ship",
				details: data,
				username: client.username
			};
			instances.master.instances[0].update_queue.push(update);
		}
	});

}

function character_toggle(socket, db, instances, client_sessions) {
	//console.log(instances.master.instances[0].environment);
	client_sessions.forEach(function(client, index){
		if (client.sessionId == socket.id) {
			if (client.mode == "ship") {
				var _callback = function(result) {
					client.mode = "character";
					result[0].object = {
						type: "character",
						name: result[0].type // character job name
					}
					var update = {
						_id: client._id,
						socket_id: socket.id,
						obj_class: "players",
						type: "character_toggle",
						details: result[0],
						username: client.username
					};
					instances.master.instances[0].update_queue.push(update);
				};
				db.queryClientDB("characters", { player_id: client._id }, _callback);
			}
			else {
				var _callback = function(result) {
					client.mode = "ship";
					var update = {
						_id: client._id,
						socket_id: socket.id,
						obj_class: "players",
						type: "character_toggle",
						details: result[0],
						username: client.username
					};
					instances.master.instances[0].update_queue.push(update);
				};
				db.queryClientDB("ships", { player_id: client._id }, _callback);
			}
		}
	});
}

function initializeClient(socket, instance, db) {

	for (var objects in instance) {

		if (typeof(instance[objects]) == "object") {
			var instruction = {};
			instruction[objects] = instance[objects];
			
			var send_instructions = function (instruction) {
				if (instruction.class == 'players') {
					socket.emit("load", instruction );
					socket.broadcast.emit("load", instruction );
				}
				else {
					socket.emit("load", instruction );
				}
			};

			prepareLoadInstructions(instruction[objects], db, send_instructions);
		}
	}
}

function prepareLoadInstructions(instance_objects, db, send_instructions) {
	instance_objects.forEach(function(instance_object, index){
		var callback = function(result) {

			result.forEach(function(obj_result){
				
				if (obj_result && obj_result._id.toString() == instance_object.object._id.toString()) {

					instance_object.name = obj_result.name;
					instance_object.obj_type = obj_result.type;
					for (var property in obj_result.details) {
						if (property == 'scale' && instance_object.scale) {}
						else {
	                    	instance_object[property] = obj_result.details[property];
	                    }
	                 }
	                 if (obj_result.sub_type) {
	                 	instance_object.sub_type = obj_result.sub_type;
	                 }
					
					send_instructions(instance_object);
				}
			});
		};
		db.queryClientDB("objects", {type: instance_object.object.type}, callback);
	
	});
}

function pong(socket, data) {
	var time = new Date().getTime(); 
	var latency = time - data.time;
	socket.emit("ping", { time: new Date().getTime(), latency: latency });
}

