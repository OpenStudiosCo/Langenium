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

var 	worldMap = [],
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
			worldMap.push(objMesh);
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
			var objMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
			objMesh.geometry.computeBoundingBox();
			
			objMesh.scale = new THREE.Vector3(scale,scale,scale);
			objMesh.position.x = obj.position.x,
			objMesh.position.y = obj.position.y,
			objMesh.position.z = obj.position.z,
			objMesh.matrixAutoUpdate = true;
			objMesh.updateMatrix();
			objMesh.updateMatrixWorld();
			objMesh.username = obj.id;
			bots.push(objMesh);
		});	
	});
}

var update_queue = [];

var time = new Date();		
function updateWorld() {
	var 	newTime = new Date(),
			delta = newTime = time;
			
	var velocityChange = -5;
	bots.forEach(function(bot, index){
		var 	newX = 0,
				newY = 0,
				newZ = 0,
				newRY = 0;
			
		newRY = Math.cos(delta/1000)/(Math.random() * 100 - 200);
		
		newX = velocityChange * Math.sin(bot.rotation.y + newRY);
		newZ = velocityChange * Math.cos(bot.rotation.y + newRY);
		newY = Math.cos(delta/1000)/(1000*Math.random() );
		
		bots[index].position.x += newX;
		bots[index].position.y += newY;
		bots[index].position.z += newZ;
		bots[index].rotation.y += newRY;
		
		var data = { pX: newX, pY: newY, pZ: newZ, rY: newRY, username: bot.username };
		//console.log(data);
		update_queue.push({ instruction: { name: "move", type: "bot", details: data } });
	});
	time = newTime;	
	update_queue.forEach(function(update, index){
		io.sockets.emit("update", update);
		update_queue.splice(index, 1);
	});
}

var tick = setInterval(updateWorld, 1000 / 33);

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
	
				var playerMovement = events.movePlayer(players_online[index].position.rotationY, data);
				
				var moveVector = new THREE.Vector3(playerMovement.instruction.details.pX, playerMovement.instruction.details.pY, playerMovement.instruction.details.pZ);
				
				var playerObj = db.getObject({ship: 'mercenary'});
				var playerMesh = new THREE.Vector3(players_online[index].position.x, players_online[index].position.y, players_online[index].position.z);
				
				var raycaster = new THREE.Raycaster(playerMesh, moveVector.normalize());
				var intersects = raycaster.intersectObjects(worldMap);
		
				var util = require('util');
				if (intersects.length > 0) {
					intersects.forEach(function(obj, index){
						if (obj.distance < 100) {
							if (players_online[index].position.rotationY > 0) 
								{ playerMovement.instruction.details.rY += obj.distance / 10000; }
							else 
								{ playerMovement.instruction.details.rY -= obj.distance / 10000; }
							
							if (playerMovement.instruction.details.pX != 0) {
								playerMovement.instruction.details.pX *= -.1;
							}
							if (playerMovement.instruction.details.pY != 0) {
								playerMovement.instruction.details.pY *= -.1;
							}
							if (playerMovement.instruction.details.pZ != 0) {
								playerMovement.instruction.details.pZ *= -.1;
							}
						}
					});		
				}
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
		{ username: "Mercenary", id: "1", type: { ship: "player" }, url: "assets/mercenary.js", position: { x: -8500, y: 3900, z: -1740 , scale: 10, rotationY: 0 }},
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


