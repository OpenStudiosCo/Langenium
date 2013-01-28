module.exports.makeWorld = makeWorld;
module.exports.updateWorld = updateWorld;
module.exports.urlPrefix = urlPrefix;

var 	urlPrefix =  "http://localhost:8080/",
		//urlPrefix = "http://langenium.com/play/",
		bullet;

function makeWorld(db, bots, THREE) {
	bullet = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 30), new THREE.MeshBasicMaterial());
	var world_map = [];
	var map_builder = db.getDummyMap();
	map_builder.forEach(function(sceneObj, index){
		var  type = sceneObj.type,
				object = db.getObject(type),
				scale = sceneObj.scale || object.scale,
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
				url = urlPrefix + object.url;
				
		makeBotMesh(url, scale, bots, obj, THREE);
	});
	return world_map;
};

function makeBotMesh(url, scale, bots, obj, THREE) {
var  loader =  new THREE.JSONLoader();
	loader.load(url, function(geometry, materials){
		var bot = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
		bot.geometry.computeBoundingBox();
		bot.scale = new THREE.Vector3(scale,scale,scale);
		bot.health = 100;
		bot.position.x = obj.position.x,
		bot.position.y = obj.position.y,
		bot.position.z = obj.position.z,
		bot.matrixAutoUpdate = true;
		bot.updateMatrix();
		bot.updateMatrixWorld();
		bot.id = obj.id;
		bot.url = url;
		bot.type = { ship: "bot" };
		bot.movement_queue = [];
		bots.push(bot); 
	});	
}

function updateWorld(bullets, delta, update_queue, bots, events, players_online, THREE, world_map, bulletCheck, shootCheck) {
	if (bulletCheck > 20) {
		handleBullets(bullets, bots, players_online, delta, update_queue, THREE);
		bulletCheck = 0;
	}
	//updateBotsFromBuffer(bullets, delta, update_queue, bots, events, players_online, THREE, world_map, shootCheck);
	players_online.forEach(function(player){
		var 	playerMovement, 
				inputData;
		if (player.inputUpdates.length > 0) {
			inputData = player.inputUpdates.shift();
	
			if ((shootCheck == true)&&(inputData.fire == true)) {
				bullets.push(addBullet(player.username, player.position, player.position.rotationY, 1, THREE));
			}
			else {
				inputData.fire = false;
			}
		}
		else {
			inputData = { d: 0, pZ: 0, pY: 0, rY: 0, fire: false };
		}
		playerMovement = events.movePlayer(player.velocity, player.position, world_map, inputData);	
		playerMovement.instruction.details.username = player.sessionId;
		playerMovement.instruction.details.velocity = player.velocity;
		playerMovement.instruction.details.health = player.health;
		update_queue.push(playerMovement);
		if  (player.velocity != 0) {
			player.velocity *= .996;
		}
		if (player.health < 100) {
			player.health += .5;
		}
	});
	
	var update_buffer = [];
	update_queue.forEach(function(update, index){
		update_buffer.push(update);
		update_queue.splice(index, 1);
	});
	return update_buffer;
};

function addBot(bots, delta, THREE){
	var db = require("./db.js");
	var obj = db.buildObject(("Pirate " + (new Date().getTime()) * Math.random()), { ship: 'pirate' }, { x: -8500, y: 5000, z: -3500, rotationY: 0 }, 10);
	
	makeBotMesh(urlPrefix + obj.url, obj.scale, bots, obj, THREE);

	obj.name = "load";
	obj.type = { ship: "bot" };
	return { instruction: {name: "load", id: obj.id, type: obj.type, url: obj.url, position: { x: obj.position.x,  y: obj.position.y,  z: obj.position.z, rotationY: obj.position.rotationY  }, scale: obj.scale } };
}

function addBullet(username, position, rotation, shifter, THREE) {

	bullet.username = username;
	bullet.position.x = position.x;
	bullet.position.y = position.y + 10;
	bullet.position.z = position.z;
	bullet.rotation.y = rotation;
	
	bullet.scale.x = 1;
	bullet.scale.y = 1;
	bullet.scale.z = 1;
	
	bullet.position.x = position.x + Math.sin(rotation) * shifter + Math.cos(rotation) * shifter;
	bullet.position.z = position.z + Math.cos(rotation) * shifter - Math.sin(rotation) * shifter;

	bullet._lifetime = 0;
	bullet.updateMatrix();
	
	return bullet;
}

function handleBullets(bullets, bots, players_online, delta, update_queue, THREE){
	bullets.forEach(function(bullet, index){
		if (bullet._lifetime > 2000) {
			bullets.splice(index, 1);
		}
		else {
			bullet.translateZ(-3 * delta);
			bullet._lifetime += delta;
			bots.forEach(function(bot, botIndex){
				if ((bot.id != bullet.username)&&(getDistance(bot, bullet) < 100)) {
					bot.health -= 1;
					if (bot.health < 0) {
						update_queue.push( addBot(bots, delta, THREE) );
						update_queue.push( { instruction: { name: "kill", type: "bot", id: bot.id } } );
						bots.splice(botIndex, 1);		
						return;
					}
					else {
						update_queue.push( { instruction: { name: "hit", type: "bot", id: bot.id } } );
						return;
					}
				}
			});
			players_online.forEach(function(player, playerIndex){
				if ((player.username != bullet.username)&&(getDistance(player, bullet) < 100)) {
					player.health -= 5;
					if (player.health < 0) {
						player.health = 100;
						update_queue.push( { instruction: { name: "kill", type: "ship", username: player.username, health: player.health } } );
						player.position.x = -8500;
						player.position.y = 5000;
						player.position.z = -1740;
						player.position.rotationY = 0;
						update_queue.push( { instruction: { name: "move", type: "player", details: { fire: 0, pX: -8500, pY: 5000, pZ: -1740, rY: 0, username: player.username } } } );
						return;
					}
					else {
						update_queue.push( { instruction: { name: "hit", type: "ship", username: player.username, health: player.health } } );
						return;
					}
				}
			});
		}
	});
}

function updateBotsFromBuffer(bullets, delta, update_queue, bots, events, players_online, THREE, world_map, shootCheck) {
	bots.forEach(function(bot, index){
		if (players_online.length > 0) {

			var 	fire = 0,
					radian = 0.01744444444444444444444444444444,
					rY = 0;	
			
			if (bot.rotation.y  > getTheta(bot, players_online[0])) {
				if (bot.rotation.y - radian < getTheta(bot, players_online[0])) { }
				else { bot.rotation.y -= radian;	rY -= radian; }
			}
			else {
				if (bot.rotation.y + radian > getTheta(bot, players_online[0])) { }
				else { bot.rotation.y += radian;	rY+= radian; }
			}
			
			if (
					bot.movement_buffer &&
					(getDistance(bots[index], players_online[0]) - bots[index].movement_buffer.distance < 200)&&
					checkMovementBuffer(bot.movement_buffer) == true
				)
				{
				var 	tX = events.moveBot(bot.movement_buffer.xBuffer), 
						tY = events.moveBot(bot.movement_buffer.yBuffer), 	
						tZ = events.moveBot(bot.movement_buffer.zBuffer);
						
				if (tX.instruction != 0) { bot.position.x += tX.instruction; bot.movement_buffer.xBuffer = tX.buffer; }
				if (tY.instruction != 0) { bot.position.y += tY.instruction; bot.movement_buffer.yBuffer = tY.buffer; }
				if (tZ.instruction != 0) { bot.position.z += tZ.instruction; bot.movement_buffer.zBuffer = tZ.buffer; }

				if (
						(getDistance(bot, players_online[0]) < 1500) &&
						(bot.rotation.y - getTheta(bot, players_online[0]) < .0314)&&
						(
							(players_online[0].position.y - bot.position.y < 50)&&
							(players_online[0].position.y - bot.position.y > -50)
						) &&
						shootCheck == true
				) {
					fire = 1;
					bullets.push(addBullet(bot.id, bot.position, bot.rotation.y, 1, THREE));
				}
				update_queue.push(
					{ instruction: { name: "move", type: "bot", details: { fire: fire, pX: bot.position.x, pY: bot.position.y, pZ: bot.position.z, rY: bot.rotation.y, id: bot.id } } }
				);
			}
			else {
				bot.movement_buffer = events.makeBotMovementBuffer(bot, players_online[0].position, getAngle(bot, players_online[0]), getDistance(bot, players_online[0]));
			}
		}
		else {
			if ((bot.movement_buffer)&&
				((bot.movement_buffer.xBuffer != 0)||
				(bot.movement_buffer.yBuffer != 0)||
				(bot.movement_buffer.zBuffer != 0))) {
					bot.movement_buffer.xBuffer = 0;
					bot.movement_buffer.yBuffer = 0;
					bot.movement_buffer.zBuffer = 0;
			}		
		}
	});
}

function getDistance(position1, position2) {
	return Math.sqrt(
		((position1.position.x - position2.position.x) * (position1.position.x - position2.position.x)) + 
		((position1.position.y - position2.position.y) * (position1.position.y - position2.position.y)) + 
		((position1.position.z - position2.position.z) * (position1.position.z - position2.position.z))
	);
}

function getAngle(position1, position2) {
	var angle = Math.atan2(-(position1.position.x - position2.position.x), 
											(position1.position.z - position2.position.z));
	angle *= 180 / Math.PI;
	return -angle;
}

function getTheta(position1, position2) {
	var theta = Math.atan2(-(position1.position.x - position2.position.x), 
											(position1.position.z - position2.position.z));
	return Math.min(-theta);
}

function checkMovementBuffer(bufferObject) {
	if ((bufferObject.xBuffer != 0)||
		(bufferObject.yBuffer != 0)||
		(bufferObject.zBuffer != 0) )
	{ return true; }
	else { return false; }
}


