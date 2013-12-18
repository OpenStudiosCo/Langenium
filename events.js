/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Events
		This class parses socket inputs into various functions
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
var os = require('os');

exports.bind_events = function (io, db, instances, client_sessions) {
	io.set('log level', 2); // supresses the console output
	io.sockets.on('connection', function (socket) {
		
		// Ping and Pong
		socket.emit("ping", { time: new Date().getTime(), latency: 0 }); 
		socket.on("pong", function(data){ pong(socket, data); });

		// Player
		socket.on("login", function(data){ login(socket, data, db, instances, client_sessions); });
		socket.on("disconnect" , function ()  { logout(socket, db, instances, client_sessions); });
		socket.on("move_ship" , function(data){ move_ship(socket, data, db, instances, client_sessions); });
		socket.on("move_character" , function(data){ move_character(socket, data, db, instances, client_sessions); });
		socket.on("character_toggle" , function(){ character_toggle(socket, db, instances, client_sessions); });

		socket.on("server_stats", function(data) { getServerStats(socket, data, db, instances, client_sessions); });
	});
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var getServerStats = function(socket, data, db, instances, client_sessions) {
	var data = {
		cpu: os.cpus(),
		loadavg: os.loadavg(),
		memory: {
			usage: process.memoryUsage(),
			free: os.freemem(),
			total: os.totalmem()
		}
	};
	socket.emit('server_stats', data);

};

var login = function(socket, data, db, instances, client_sessions) {
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

			instances[player.instance_id].addObject(player, instances[player.instance_id].players);

			if (instances[player.instance_id].type == 'outdoor') {
				client_sessions.push({	_id: player._id,
										sessionId: socket.id,
										mode: "ship",
										socket: socket,
										instance_id: player.instance_id,
										username: player.username });

				db.queryClientDB("ships", { player_id: player._id }, user_ship);
			}	
			if (instances[player.instance_id].type == 'indoor') {
				client_sessions.push({	_id: player._id,
										sessionId: socket.id,
										mode: "character",
										socket: socket,
										instance_id: player.instance_id,
										username: player.username });
				db.queryClientDB("characters", { player_id: player._id }, user_character);
			}	


			
		};

		// Login a player as a ship
		var user_ship = function(result) {
			var ship = result[0];
			ship.socket_id = socket.id;
			ship.editor = data.editor;
			ship.username = player.username;
			ship.position = player.position;
			ship.rotation = player.rotation;
			ship.velocity = 0;
			// check if we're dealing with a container
			instances[player.instance_id].addObject(ship, instances[player.instance_id].ships);
			
			db.queryClientDB("instances", { instance_id: player.instance_id}, user_instance);

		};

		// Login a player as a character
		var user_character = function(result) {
			var character = result[0];
			character.socket_id = socket.id;
			character.editor = data.editor;
			character.username = player.username;
			character.position = player.position;
			character.rotation = player.rotation;
			
			// check if we're dealing with a container
			instances[player.instance_id].addObject(character, instances[player.instance_id].characters);
			
			db.queryClientDB("instances", { instance_id: player.instance_id}, user_instance);
		}


		var user_instance = function(result) {
			socket.emit("load_scene", result[0]);
			initializeClient(socket, instances[player.instance_id], db);
		}


		db.queryClientDB("players", { username: data.username }, loginUser);
	
	}
	
										
}

var logout = function(socket, db, instances, client_sessions) {

	client_sessions.forEach(function(client, index){
		if (client.sessionId == socket.id) {
			socket.broadcast.emit('logout', { socket_id: socket.id }); // change to sessionID later
			instances[client_sessions[index].instance_id].characters.forEach(function(character, character_index) {
				if (socket.id == character.socket_id) {
					instances[client_sessions[index].instance_id].characters.splice(character_index, 1);
				}
			});
			instances[client_sessions[index].instance_id].players.forEach(function(player, player_index) {
				if (socket.id == player.socket_id) {
					instances[client_sessions[index].instance_id].players.splice(player_index, 1);
				}
			});
			instances[client_sessions[index].instance_id].ships.forEach(function(ship, ship_index) {
				if (socket.id == ship.socket_id) {
					instances[client_sessions[index].instance_id].ships.splice(ship_index, 1);
				}
			});
			client_sessions.splice(index, 1);
			delete socket;
		}			
	});
}

var move_ship = function(socket, data, db, instances, client_sessions) {
	//console.log(instances.master.instances[0].environment);
	client_sessions.forEach(function(client, index){
		if (client.sessionId == socket.id) {
			instances[client_sessions[index].instance_id].update_queue.push({
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

var move_character = function(socket, data, db, instances, client_sessions) {
	//console.log(instances.master.instances[0].environment);
	client_sessions.forEach(function(client, index){
		if (client.sessionId == data.socket_id) {
			instances[client_sessions[index].instance_id].update_queue.push({
				_id: client._id,
				socket_id: data.socket_id,
				obj_class: "characters",
				type: "move_character",
				details: data
			});
		}
	});
}

var character_toggle = function(socket, db, instances, client_sessions) {
	//console.log(instances.master.instances[0].environment);
	client_sessions.forEach(function(client, index){
		if (client.sessionId == socket.id) {
			if (client.mode == "ship") {
				instances[client_sessions[index].instance_id].ships.forEach(function(ship){
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
						
							instances[client.instance_id].addObject(character, instances[client.instance_id].characters);
							
							instances[client.instance_id].update_queue.push({
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
					instances[client_sessions[index].instance_id].characters.forEach(function(character, char_index) {
						if (socket.id == character.socket_id) {
							instances[client_sessions[index].instance_id].characters.splice(char_index, 1);
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
					instances[client_sessions[index].instance_id].update_queue.push(update);
				};
				db.queryClientDB("ships", { player_id: client._id }, _callback);
			}
		}
	});
}

var pong = function(socket, data) {
	var time = new Date().getTime(); 
	var latency = time - data.time;
	socket.emit("ping", { time: new Date().getTime(), latency: latency });
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Helper Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var initializeClient = function(socket, instance, db) {

	for (var objects in instance) {
		var instruction = {};
		instruction[objects] = instance[objects];
		if (objects == "environment" || objects == "ships") {
			var send_instructions = function (instruction) {
				if (instruction.class == 'ships') {
					socket.emit("load_object", instruction );
					socket.broadcast.emit("load_object", instruction );
				}
				else {
					socket.emit("load_object", instruction );
				}
			};
			
			prepareLoadInstructions(instruction[objects], db, send_instructions);
		}
		if (objects == "characters") {
			socket.emit("load_character", instruction);
		}
	}
}

var prepareLoadInstructions = function(instance_objects, db, send_instructions) {
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


