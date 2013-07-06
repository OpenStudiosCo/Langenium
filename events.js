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
module.exports.move = move;


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
		}			
	});
}

function move(socket, data, db, instances, client_sessions) {
	//console.log(instances.master.instances[0].environment);
	client_sessions.forEach(function(client, index){
		if (client.sessionId == socket.id) {
			var update = {
				_id: client._id,
				socket_id: socket.id,
				obj_class: "players",
				type: "move",
				details: data,
				username: client.username
			};
			instances.master.instances[0].update_queue.push(update);
		}
	});
}

function initializeClient(socket, instance, db) {

	for (var objects in instance) {
		if (typeof(instance[objects]) == "object") {
			var instruction = {};
			instruction[objects] = instance[objects];
			
			var send_instructions = function (instruction) {
				socket.emit("load", instruction );
				
				if (instruction.class == 'players') {

					instruction.class = 'ship';
					socket.broadcast.emit("load", instruction );
				}
			};
			prepareLoadInstructions(instruction[objects], db, send_instructions);
		}
	}
}

function prepareLoadInstructions(objects, db, send_instructions) {
	objects.forEach(function(object, index){
		for (var obj in object.type) {
			var callback = function(result) {
				result.forEach(function(obj_result){
					if (obj_result && obj_result.name == object.type[obj]) {
						object.name = obj_result.name;
						object.obj_type = obj_result.type;
						for (var property in obj_result.details) {
							if (property == 'scale' && object.scale) {}
							else {
		                    	object[property] = obj_result.details[property];
		                    }
		                 }
		                 if (obj_result.sub_type) {
		                 	object.sub_type = obj_result.sub_type;
		                 }
						 send_instructions(object);
					}
				});
			};
			db.queryClientDB("objects", {type: obj}, callback);
		}
	});
}

function pong(socket, data) {
	var time = new Date().getTime(); 
	var latency = time - data.time;
	socket.emit("ping", { time: new Date().getTime(), latency: latency });
}

