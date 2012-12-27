/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Startup
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
var app = require('http').createServer(function (request, response) { if (url.parse(request.url).pathname.indexOf("socket.io") <= 0)  { response.writeHead(301, { 'Location': 'http://langenium.com/play' }); } response.end(); })
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , jade = require('jade')
  , url = require('url');

app.listen(80);

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Socket event handlers
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
io.set('log level', 2);
io.set('transports', ['jsonp-polling']);

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
		var playerMovement = movePlayer(data, socket.id);
		socket.emit('update', playerMovement); 
		socket.broadcast.emit('update', playerMovement); 
	});

}); 

// ENGINE VARIABLES
var players_online = [];
var players = [ 
		{ username: "Mercenary", uid: "1", type: "player", url: "assets/mercenary.js", position: { x: -1000, y: 3000, z: 5000 , scale: 10, rotationY: 0 }},
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
	
	getLoadInstructions("map").forEach(function(instruction){initial_instructions.push(instruction);});
	
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
	Scene Loader
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
function getLoadInstructions(set) {
	var res;
	var location;
	switch (set) {
		case "map":
			res = getMap();
			break;
		case "ships":
			res = getEnemies(location);
			break;
	}
	return res; 
}

function getEnemies(location) {
	var enemies = getDummyEnemies();
	return enemies;
}

function getMap(location) {
	var map = getDummyMap();
	return map;
}

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Movement and location
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

function movePlayer(data, socketId) {
	var velocityChange = 300 * data.d;
	var rotateAngle = .045;
	var retval;
	
	players_online.forEach(function(player, index){
		if (player.sessionId == socketId) {
			
			var velocity = 0;
			
			if (data.pZ > 0) { velocity = -velocityChange; } 				// forward
			if (data.pZ < 0) { velocity = velocityChange / 4; }			// back
			if (data.rY > 0) { data.rY = rotateAngle; }						// left
			if (data.rY < 0) { data.rY = -rotateAngle; }					// right
			if (data.pY > 0) { data.pY = velocityChange / 2; } 			// up
			if (data.pY < 0) { data.pY = -(velocityChange / 2); } 		// down
			
			data.rY = (data.rY + data.rY * Math.PI / 180);

			players_online[index].position.rotationY +=  data.rY;
			
			data.pX = velocity * Math.sin(players_online[index].position.rotationY);
			data.pZ = velocity * Math.cos(players_online[index].position.rotationY);
			
			data.username = socketId;

			players_online[index].position.y += data.pY;
			players_online[index].position.x += data.pX; 
			players_online[index].position.z += data.pZ;
			//console.log("pX: " + players_online[index].position.x + "  pY: " + players_online[index].position.y + "  pZ: " + players_online[index].position.z + "  rY: " + players_online[index].position.rotationY);

			retval = { instruction: { name: "move", details: data } };
		}
	});
	return retval;
}

// This is what mimics AI path movement
function moveTarget(target, key) {
	
}

function detectCollision(position1, position2) {
	var collision_distance = 300,
		distance = Math.sqrt((position1.x-position2.x)^2 + (position1.y-position2.y)^2 + (position1.z-position2.z)^2);
	if (distance <= collision_distance) { return true; }
	else { return false; }
}

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Utility functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

function spawn(uid, position) {
	position.scale = 10;
	return { name: "load", details: { uid: uid, type: "monster", url: "assets/pirate.js", position: position}};
}

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Test functions
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

/* =============================================================================

 Dummy Environment 
 -------------------------------
 
 Players:
  Bob 
  Sharky
  
 Enemies:
  Pirate 1
  Pirate 2
  
  Server startup event:
	???
  Player login event:
	1. Determine player location
	2. Load objects around player 
  Player continuous events:
	- Player movement
	- Monster movement
	- Cloud movement

=============================================================================*/

function getDummyEnemies() {
	var enemies = [];
	enemies.push({ name: "load", details: { uid: 1, type: "monster", url: "assets/pirate.js", position: { x: -2000, y: 2200, z: -3800, scale: 10 }}});
	enemies.push({ name: "load", details: { uid: 2, type: "monster", url: "assets/pirate.js", position: { x: -1000, y: 1800, z: -2900, scale: 10 }}});
	enemies.push({ name: "load", details: { uid: 3, type: "monster", url: "assets/pirate.js", position: { x: -1000, y: 1800, z: -2000, scale: 10 }}});
	enemies.push({ name: "load", details: { uid: 4, type: "monster", url: "assets/pirate.js", position: { x: -1000, y: 2000, z: -2700, scale: 10 }}});
	enemies.push({ name: "load", details: { uid: 5, type: "monster", url: "assets/pirate.js", position: { x: -3000, y: 2100, z: -5000, scale: 10 }}});
	enemies.push({ name: "load", details: { uid: 6, type: "monster", url: "assets/pirate.js", position: { x: -3000, y: 1800, z: -4000, scale: 10 }}});
	return enemies;
}

function getDummyMap() {
	var map = [];
	map.push({ name: "load", details: { uid: 1, type: "platform", url: "assets/union-platform-plain.js", position: { x: -8500, y: 500, z: -5000, scale: 1000 }}});
	map.push({ name: "load", details: { uid: 1, type: "island", url: "assets/island.js", position: { x: 5500, y: -500, z: -10500, scale: 450 }}});
	map.push({ name: "load", details: { uid: 2, type: "island", url: "assets/island.js", position: { x: 3000, y: -1000, z: -13000, scale: 800 }}});
	map.push({ name: "load", details: { uid: 3, type: "island", url: "assets/island.js", position: { x: 0, y: -400, z: -14500, scale: 300 }}});
	map.push({ name: "load", details: { uid: 4, type: "island", url: "assets/island.js", position: { x: -3500, y: 0, z: -4500, scale: 250 }}});
	map.push({ name: "load", details: { uid: 5, type: "island", url: "assets/island.js", position: { x: -6500, y: 0, z: -17500, scale: 550 }}});
	map.push({ name: "load", details: { uid: 6, type: "island", url: "assets/island.js", position: { x: 1900, y: 0, z: -13500, scale: 250 }}});
	map.push({ name: "load", details: { uid: 7, type: "island", url: "assets/island.js", position: { x: 1100, y: -50, z: -16500, scale: 200 }}});
	map.push({ name: "load", details: { uid: 8, type: "island", url: "assets/island.js", position: { x: 1000, y: -100, z: -16000, scale: 300 }}});
	map.push({ name: "load", details: { uid: 9, type: "island", url: "assets/island.js", position: { x: -5000, y: 0, z: -18500, scale: 700 }}});
	map.push({ name: "load", details: { uid: 10, type: "island", url: "assets/island.js", position: { x: -1500, y: 0, z: -16500, scale: 350 }}});
	map.push({ name: "load", details: { uid: 11, type: "island", url: "assets/island.js", position: { x: -3500, y: 0, z: -15500, scale: 300 }}});
	map.push({ name: "load", details: { uid: 12, type: "island", url: "assets/island.js", position: { x: 8000, y: 0, z: -9500, scale: 700 }}});
	return map;
}
