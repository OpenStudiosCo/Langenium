/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Startup
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

var app = require('http').createServer(function (request, response) { if (url.parse(request.url).pathname.indexOf("socket.io") <= 0)  { response.writeHead(301, { 'Location': 'http://langenium.com/play' }); } response.end(); })
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , db = require("./db.js")
  , events = require("./events.js")
  , THREE = require('three');
  
app.listen(80);

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Socket event handlers
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
io.set('log level', 2);

var 	world_map = [],
		bots = [];

buildWorldMap();
function buildWorldMap(){
	var map_builder = db.getDummyMap();
	map_builder.forEach(function(sceneObj, index){
		var 	type = sceneObj.type,
				object = db.getObject(type),
				scale = sceneObj.scale || object.scale,
				urlPrefix = "http://langenium.com/play/",
				loader =  new THREE.JSONLoader(),
				url = object.url;
				
		loader.load(urlPrefix + url, function(geometry, materials){
			var objMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
			objMesh.geometry.computeBoundingBox();
			
			objMesh.scale = new THREE.Vector3(scale,scale,scale);
			objMesh.position.x = sceneObj.position.x,
			objMesh.position.y = sceneObj.position.y,
			objMesh.position.z = sceneObj.position.z,
			objMesh.matrixAutoUpdate = true;
			objMesh.updateMatrix();
			objMesh.updateMatrixWorld();
			world_map.push(objMesh);
		});	
	});
	
	var bot_builder = db.getDummyEnemies();
	bot_builder.forEach(function(obj, index){
		var 	type = obj.type,
				object = db.getObject(type),
				scale = obj.scale || object.scale,
				urlPrefix = "http://langenium.com/play/",
				loader =  new THREE.JSONLoader(),
				url = object.url;
				
		loader.load(urlPrefix + url, function(geometry, materials){
			var bot = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
			bot.geometry.computeBoundingBox();
			
			bot.scale = new THREE.Vector3(scale,scale,scale);
			bot.position.x = obj.position.x,
			bot.position.y = obj.position.y,
			bot.position.z = obj.position.z,
			bot.matrixAutoUpdate = true;
			bot.updateMatrix();
			bot.updateMatrixWorld();
			bot.username = obj.id;
			bot.movement_queue = [];
			bots.push(bot);
		});	
	});
}

var 	time = new Date(),
		update_queue = [];

function updateWorld() {			
	bots.forEach(function(bot, index){
		var 
			delta = (new Date()) - time;
			movement = events.moveBot(delta, bots[index], world_map);
	
		update_queue.push(movement);
		
	});
	time = new Date();
	players_online.forEach(function(player, index){
		var data = { d: 0, rY: 0, pY: 0 }; // faking it for now
		if (players_online[index].velocity > 0) {
			data.pZ = 1;
		}
		else {
			if (players_online[index].velocity < 0) { 
				data.pZ = -1;
			}
			else {
				data.pZ = 0;
			}
		}
				
		var playerMovement = events.movePlayer(players_online[index].velocity, players_online[index].position, world_map, data);
		players_online[index].position.y += playerMovement.instruction.details.pY;
		players_online[index].position.x += playerMovement.instruction.details.pX; 
		players_online[index].position.z += playerMovement.instruction.details.pZ;
		playerMovement.instruction.details.username = players_online[index].sessionId;
		players_online[index].position.rotationY +=  playerMovement.instruction.details.rY;
		
	
		if (players_online[index].velocity > 0) {
			players_online[index].velocity -= .01;
		}
		if (players_online[index].velocity < 0) {
			players_online[index].velocity += .01;
		}
		update_queue.push(playerMovement);
	});
	var update_buffer = [];
	update_queue.forEach(function(update, index){
		update_buffer.push(update);
		update_queue.splice(index, 1);
	});
	io.sockets.emit("update", update_buffer);
}

var tick = setInterval(updateWorld, 1000 / 66);

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
				
				if ((data.pZ > 0)&&(players_online[index].velocity > -3)){ 
					players_online[index].velocity -= 3 * data.d; 
				} 			
				if  ((data.pZ < 0)&&(players_online[index].velocity < 1.5)) { 
					players_online[index].velocity  += 1.5 * data.d; 
				}			
				var playerMovement = events.movePlayer(players_online[index].velocity, players_online[index].position, world_map, data);
				players_online[index].position.y += playerMovement.instruction.details.pY;
				players_online[index].position.x += playerMovement.instruction.details.pX; 
				players_online[index].position.z += playerMovement.instruction.details.pZ;
				playerMovement.instruction.details.username = socket.id;
				players_online[index].position.rotationY +=  playerMovement.instruction.details.rY;
				update_queue.push(playerMovement);
			}
		});
	});
}); 

// ENGINE VARIABLES
var players_online = [];
var players = [ 
		{ username: "Mercenary", id: "1", type: { ship: "player" }, url: "assets/mercenary.js", position: { x: -8500, y: 5500, z: -1740 , scale: 10, rotationY: 0 }},
		//{ username: "Pirate", uid: "2", type: "player", url: "assets/pirate.js", position: { x: -1000, y: 3000, z: 5500 , scale: 10, rotationY: 0 }}
		{ username: "Pirate", id: "2", type: { ship: "player" }, url: "assets/pirate.js", position: { x: 0, y: 0, z: 0 , scale: 10, rotationY: 0 }}
	];
	
/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// w//////////////////////
	Client Events
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
function loginPlayer(sessionId, username) {
	var retval;
	players.forEach(function(player){
		if (player.username == username) {
			var online_player = cloneObject(player);
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
	db.getLoadInstructions("bots").forEach(function(instruction){ 
		instruction.name = "load"; 
		if (bots.length > 0) {
			bots.forEach(function(bot, index) {
				if (bot.username == instruction.id) {
					instruction.position.x = bots[index].position.x;
					instruction.position.y = bots[index].position.y;
					instruction.position.z = bots[index].position.z;
					instruction.position.rotationY = bots[index].rotation.y;
				}
			});
		}
		initial_instructions.push(instruction);
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


