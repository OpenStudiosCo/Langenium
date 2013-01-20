/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Startup
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

var app = require('http').createServer(function (request, response) { if (url.parse(request.url).pathname.indexOf("socket.io") <= 0)  { response.writeHead(301, { 'Location': 'http://langenium.com/play' }); } response.end(); })
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , db = require("./db.js")
  , world = require("./world.js")
  , events = require("./events.js")
  , THREE = require('three');
  
app.listen(80);

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	ENGINE VARIABLES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
var bots = [];
var players_online = [];
var bullets = [];
var players = [ 
		{ username: "Mercenary", id: "1", type: { ship: "player" }, url: "assets/mercenary.js", position: { x: -8500, y: 5000, z: -1740 , scale: 10, rotationY: 0 }},
		//{ username: "Pirate", uid: "2", type: "player", url: "assets/pirate.js", position: { x: -1000, y: 3000, z: 5500 , scale: 10, rotationY: 0 }}
		{ username: "Pirate", id: "2", type: { ship: "player" }, url: "assets/pirate.js", position: { x: 0, y: 0, z: 0 , scale: 10, rotationY: 0 }}
	];
	
/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Socket event handlers
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
io.set('log level', 2);

var 	update_queue = [];

var world_map = world.makeWorld(db, bots, THREE);

var worldTime = new Date().getTime(); 

var tick = setInterval(function(){
	var newTime = new Date().getTime(); 
	io.sockets.emit("update", world.updateWorld(bullets, newTime - worldTime, update_queue, bots, events, players_online, THREE, world_map));
	worldTime = newTime; 
}, 1000 / 66);

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
			ship.type = {ship: "ship"}
			
			socket.broadcast.emit('load', { instructions: [ {name: "load", username: ship.username, type: ship.type, url: ship.url, position: ship.position, scale: ship.position.scale, rotationY: ship.position.rotationY} ] });
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
				
				if ((data.pZ > 0)&&(player.velocity > -6)){ 
					player.velocity -= 15 * data.d; 
				} 			
				if  ((data.pZ < 0)&&(player.velocity < 3)) { 
					player.velocity  += 7.5 * data.d; 
				}			
				player.inputUpdates.push(data);
			}
		});
	});
}); 


	
/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// w//////////////////////
	Client Events
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
function loginPlayer(sessionId, username) {
	var retval;
	players.forEach(function(player){
		if (player.username == username) {
			var online_player = cloneObject(player);
			online_player.inputUpdates = []; 
			online_player.username = sessionId; 
			online_player.sessionId = sessionId;
			online_player.velocity = 0;
			online_player.velocityChange = 0;
			players_online.push(online_player);
			players_online[players_online.length-1].sessionId = sessionId;
			retval = online_player;
		}
	});
	return retval;
}

function initializeClient(activePlayer) {
	var initial_instructions = [];

	db.getLoadInstructions("map").forEach(function(instruction){ instruction.name = "load"; initial_instructions.push(instruction);});
	bots.forEach(function(bot, index){
		initial_instructions.push({name: "load", id: bots[index].id, type: bots[index].type, url: bots[index].url, position: { x: bots[index].position.x,  y: bots[index].position.y,  z: bots[index].position.z, rotationY: bots[index].rotation.y , scale: bots[index].scale.x }  });
	});
	
	//getLoadInstructions("ships").forEach(function(instruction){initial_instructions.push(instruction);});

	players_online.forEach(function(player, index){
		if (player.username != activePlayer.username) {		
			// had to do this to de-reference player so that changing .type didn't override 
			var ship = cloneObject(player);
			ship.type = { ship: "ship" };
			initial_instructions.push({name: "load", username: ship.username, type: ship.type, url: ship.url, position: ship.position, scale: ship.position.scale, rotationY: ship.position.rotationY});
		}
		else {
			initial_instructions.push({name: "load", username: player.username, type: player.type, url: player.url, position: player.position, scale: player.position.scale, rotationY: player.position.rotationY});
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


