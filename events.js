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
			// check if we're dealing with a container
			if (instances[player.instance_id].instances) {

				instances[player.instance_id].addObjectToContainer(player, instances[player.instance_id].instances[0].players);
				initializeClient(socket, instances[player.instance_id].instances[0], db);
			}
			else {
				instances[player.instance_id].addObjectToWorld(player, instances[player.instance_id].players);
				initializeClient(socket, instances[player.instance_id], db);
			}
		
		client_sessions.push({	sessionId: socket.id,
												instance_id: player.instance_id,
												username: player.username });
	
	};
	
	db.queryClientDB("players", { username: data.username }, loginUser);
	
	}
										
}

function logout(socket, db, instances, client_sessions) {

	client_sessions.forEach(function(client, index){
			if (client.sessionId == socket.id) {
				socket.broadcast.emit('logout', { username: client.username }); // change to sessionID later

				instances[client_sessions[index].instance_id].instances[0].players.forEach(function(player, player_index) {
					if (player.username == client_sessions[index].username) {
						instances[client_sessions[index].instance_id].instances[0].players.splice(player_index, 1);
					}
				});
				
				client_sessions.splice(index, 1);
			}		
		});
	delete socket;
}

function initializeClient(socket, instance, db) {

	for (var objects in instance) {
		if (typeof(instance[objects]) == "object") {
			var instruction = {};
			instruction[objects] = instance[objects];
			
			var send_instructions = function (instruction) {
				socket.emit("load", instruction );
			};
			prepareLoadInstructions(instruction[objects], db, send_instructions);
		}
	}
}

function prepareLoadInstructions(objects, db, send_instructions) {
	objects.forEach(function(object, index){
		for (var obj in object.type) {
			var val = function(result) {
				var val = result[0];
				for (var property in val.details) {
                                object[property] = val.details[property];
                 }
				 send_instructions(object);
			};
			db.queryClientDB("objects", {type: obj}, val);
		}
	});
}

function pong(socket, data) {
	var time = new Date().getTime(); 
	var latency = time - data.time;
	socket.emit("ping", { time: new Date().getTime(), latency: latency });
}

