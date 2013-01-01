/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Startup
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

var app = require('http').createServer(function (request, response) { if (url.parse(request.url).pathname.indexOf("socket.io") <= 0)  { response.writeHead(301, { 'Location': 'http://langenium.com/play' }); } response.end(); })
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , jade = require('jade')
  , url = require('url')
  , db = require("./db.js")
  , events = require("./events.js");
  
app.listen(80);

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Socket event handlers
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
io.set('log level', 2);

io.sockets.on('connection', function (socket) {
	
	socket.emit("ping", { time: new Date().getTime(), latency: 0});
	socket.on("pong", function(data){
		var time = new Date().getTime(); 
		var latency = time - data.time;
		socket.emit("ping", { time: new Date().getTime(), latency: latency});
	});
	
	socket.on("login", function(data){
		var player = loginPlayer(socket.id, data.username);
		if (player.username.length > 0) {
			socket.emit('load', { instructions: initializeClient(player) });
			
			var ship = cloneObject(player);
			ship.type = "ship";
			socket.broadcast.emit('load', { instructions: [ {name: "load", details: ship} ] });
		}
		else {
			console.log("Login failure");
		}
	});
	socket.on("disconnect" , function ()  {
		players_online.forEach(function(player, index){
			if (player.sessionId == socket.id) {
				socket.broadcast.emit('playerDisconnected', { username: player.username }); // change to sessionID later
				players_online.splice(index, 1);
			}		
		});
		delete socket;
	});
	
	socket.on('move', function(data){
	
		players_online.forEach(function(player, index){
			if (player.sessionId == socket.id) {
				
				var playerMovement = events.movePlayer(players_online[index].position.rotationY, data);
				
				players_online[index].position.rotationY +=  playerMovement.instruction.details.rY;
				players_online[index].position.y += playerMovement.instruction.details.pY;
				players_online[index].position.x += playerMovement.instruction.details.pX; 
				players_online[index].position.z += playerMovement.instruction.details.pZ;
				
				playerMovement.instruction.details.username = socket.id;
						
				socket.emit('update', playerMovement); 
				socket.broadcast.emit('update', playerMovement); 
			}
		});
	});
}); 

// ENGINE VARIABLES
var players_online = [];
var players = [ 
		{ username: "Mercenary", uid: "1", type: "player", url: "assets/mercenary.js", position: { x: -8000, y: 3000, z: 000 , scale: 10, rotationY: 0 }},
		//{ username: "Pirate", uid: "2", type: "player", url: "assets/pirate.js", position: { x: -1000, y: 3000, z: 5500 , scale: 10, rotationY: 0 }}
		{ username: "Pirate", uid: "2", type: "player", url: "assets/pirate.js", position: { x: 0, y: 0, z: 0 , scale: 10, rotationY: 0 }}
	];
	
/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Client Events
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
function loginPlayer(sessionId, username) {
	var retval;
	players.forEach(function(player){
		if (player.username == username) {
			var online_player = cloneObject(player);
			online_player.username = sessionId; 
			online_player.sessionId = sessionId;
			players_online.push(online_player);
			players_online[players_online.length-1].sessionId = sessionId;
			retval = online_player;
		}
	});
	return retval;
}

function initializeClient(activePlayer) {
	var initial_instructions = [];
	
	db.getLoadInstructions("map").forEach(function(instruction){initial_instructions.push(instruction);});
	
	//getLoadInstructions("ships").forEach(function(instruction){initial_instructions.push(instruction);});

	players_online.forEach(function(player, index){
		if (player.username != activePlayer.username) {		
			// had to do this to de-reference player so that changing .type didn't override 
			var ship = cloneObject(player);
			ship.type = "ship";
			initial_instructions.push({name: "load", details: ship});
		}
		else {
			initial_instructions.push({name: "load", details: player});
		}
	});
	return initial_instructions;
}

function cloneObject(obj) {
        var clone = {};
        for(var i in obj) {
            if(typeof(obj[i])=="object")
                clone[i] = cloneObject(obj[i]);
            else
                clone[i] = obj[i];
        }
        return clone;
}

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Utility functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

function spawn(uid, position) {
	position.scale = 10;
	return { name: "load", details: { uid: uid, type: "monster", url: "assets/pirate.js", position: position}};
}


