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
module.exports.move_character = move_character;
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
		var player;
		var loginUser = function(result) { 
		
			player = result[0];
			player.editor = data.editor;
			player.socket_id = socket.id;
			player.input_status = false;

			// check if we're dealing with a container
			if (instances[player.instance_id].instances) {
				instances[player.instance_id].addObjectToContainer(player, instances[player.instance_id].instances[0].players);
			}
			else {
				instances[player.instance_id].addObjectToWorld(player, instances[player.instance_id].players);
			}
			
			client_sessions.push({	_id: player._id,
									sessionId: socket.id,
									mode: "ship",
									socket: socket,
									instance_id: player.instance_id,
									username: player.username });
			db.queryClientDB("ships", { player_id: result[0]._id }, user_ship);
		};

		var user_ship = function(result) {
			var ship = result[0];
			ship.socket_id = socket.id;
			ship.editor = data.editor;
			ship.username = player.username;
			ship.position = player.position;
			ship.rotation = player.rotation;
			ship.velocity = 0;
			// check if we're dealing with a container
			if (instances[player.instance_id].instances) {
				instances[player.instance_id].addObjectToContainer(ship, instances[player.instance_id].instances[0].ships);
				initializeClient(socket, instances[player.instance_id].instances[0], db);
			}
			else {
				instances[player.instance_id].addObjectToWorld(ship, instances[player.instance_id].ships);
				initializeClient(socket, instances[player.instance_id], db);
			}

		};


		db.queryClientDB("players", { username: data.username }, loginUser);
	
	}
										
}



function logout(socket, db, instances, client_sessions) {

	client_sessions.forEach(function(client, index){
		if (client.sessionId == socket.id) {
			socket.broadcast.emit('logout', { socket_id: socket.id }); // change to sessionID later
			instances[client_sessions[index].instance_id].instances[0].characters.forEach(function(character, character_index) {
				if (socket.id == character.socket_id) {
					instances[client_sessions[index].instance_id].instances[0].characters.splice(character_index, 1);
				}
			});
			instances[client_sessions[index].instance_id].instances[0].players.forEach(function(player, player_index) {
				if (socket.id == player.socket_id) {
					instances[client_sessions[index].instance_id].instances[0].players.splice(player_index, 1);
				}
			});
			instances[client_sessions[index].instance_id].instances[0].ships.forEach(function(ship, ship_index) {
				if (socket.id == ship.socket_id) {
					instances[client_sessions[index].instance_id].instances[0].ships.splice(ship_index, 1);
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
			instances.master.instances[0].update_queue.push({
				_id: client._id,
				socket_id: socket.id,
				obj_class: "ships",
				type: "move_ship",
				details: data,
				username: client.username
			});
		}
	});

}
function move_character(socket, data, db, instances, client_sessions) {
	//console.log(instances.master.instances[0].environment);
	client_sessions.forEach(function(client, index){
		if (client.sessionId == data.socket_id) {
			instances.master.instances[0].update_queue.push({
				_id: client._id,
				socket_id: data.socket_id,
				obj_class: "characters",
				type: "move_character",
				details: data
			});
		}
	});

}
function character_toggle(socket, db, instances, client_sessions) {
	//console.log(instances.master.instances[0].environment);
	client_sessions.forEach(function(client, index){
		if (client.sessionId == socket.id) {
			if (client.mode == "ship") {
				instances[client_sessions[index].instance_id].instances[0].ships.forEach(function(ship){
					if (ship.socket_id == socket.id) {
						var _callback = function(result) {
							var character = result[0];
							client.mode = "character";
							character.socket_id = socket.id;
							character.face = 'back';
							character.moving = false;
							character.position = {
								x: ship.position.x,
								y: ship.position.y,
								z: ship.position.z
							};
							character.rotation = {
								x: ship.rotation.x,
								y: ship.rotation.y,
								z: ship.rotation.z
							};
							character.object = {
								type: "characters",
								name: result[0].type // character job name
							}
							
							if (instances[client.instance_id].instances) {
								instances[client.instance_id].addObjectToContainer(character, instances[client.instance_id].instances[0].characters);
							}
							else {
								instances[client.instance_id].addObjectToWorld(character, instances[client.instance_id].characters);
							}
							instances.master.instances[0].update_queue.push({
								_id: client._id,
								socket_id: socket.id,
								obj_class: "players",
								type: "character_toggle",
								details: result[0],
								username: client.username
							});
						};
						db.queryClientDB("characters", { player_id: client._id }, _callback);
					}
				});
				
			}
			else {
				var _callback = function(result) {
					client.mode = "ship";
					instances[client_sessions[index].instance_id].instances[0].characters.forEach(function(character, char_index) {
						if (socket.id == character.socket_id) {
							instances[client_sessions[index].instance_id].instances[0].characters.splice(char_index, 1);
						}
					});
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
		var instruction = {};
		instruction[objects] = instance[objects];
		if (objects == "environment" || objects == "ships") {
			var send_instructions = function (instruction) {
				if (instruction.class == 'ships') {
					socket.emit("load", instruction );
					socket.broadcast.emit("load", instruction );
				}
				else {
					socket.emit("load", instruction );
				}
			};
			
			prepareLoadInstructions(instruction[objects], db, send_instructions);
		}
		if (objects == "characters") {
			instance.characters.forEach(function(character){
				var instruction = {
					_id: character._id,
					socket_id: character.socket_id,
					obj_class: "players",
					type: "character_toggle",
					details: character.details,
					username: character.username
				};
				socket.emit("character_toggle", instruction);
			});
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

