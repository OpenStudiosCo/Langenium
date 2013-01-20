module.exports.makeWorld = makeWorld;
module.exports.updateWorld = updateWorld;

function makeWorld(db, bots, THREE) {
	var world_map = [];
	var map_builder = db.getDummyMap();
	map_builder.forEach(function(sceneObj, index){
		var  type = sceneObj.type,
				object = db.getObject(type),
				scale = sceneObj.scale || object.scale,
				urlPrefix = "http://localhost:8080/",
				//urlPrefix = "http://langenium.com/play/",
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
				urlPrefix = "http://localhost:8080/",
				//urlPrefix = "http://langenium.com/play/", 
				loader =  new THREE.JSONLoader(),
				url = object.url;
				
		loader.load(urlPrefix + url, function(geometry, materials){
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
	});
	return world_map;
};

function updateWorld(bullets, delta, update_queue, bots, events, players_online, THREE, world_map) {
	handleBullets(bullets, bots, players_online, delta, update_queue);
	updateBotsFromBuffer(bullets, delta, update_queue, bots, events, players_online, THREE, world_map);
	time = new Date();
	players_online.forEach(function(player){
		var 	playerMovement, 
				inputData;
		if (player.inputUpdates.length > 0) {
			inputData = player.inputUpdates.shift();
	
			if ((delta >16)&&(inputData.fire == true)) {
				bullets.push(addBullet(player.username, player.position, player.position.rotationY, 20, THREE));
				bullets.push(addBullet(player.username, player.position, player.position.rotationY, -20, THREE));
			}
			else {
				inputData.fire = false;
			}
		}
		else {
			inputData = { d: 0, pZ: 0, pY: 0, rY: 0, fire: false };
		}
		playerMovement = events.movePlayer(player.velocity, player.position, world_map, inputData);	
		player.position.y += playerMovement.instruction.details.pY;
		player.position.x += playerMovement.instruction.details.pX; 
		player.position.z += playerMovement.instruction.details.pZ;
		player.position.rotationY +=  playerMovement.instruction.details.rY;
		playerMovement.instruction.details.username = player.sessionId;
		update_queue.push(playerMovement);
		if (player.velocity > 0) {
			player.velocity -= .05;
		}
		if (player.velocity < 0) {
			player.velocity += .05;
		}
	});
	
	var update_buffer = [];
	update_queue.forEach(function(update, index){
		update_buffer.push(update);
		update_queue.splice(index, 1);
	});
	return update_buffer;
};

function addBullet(username, position, rotation, shifter, THREE) {
	var geometry = new THREE.CubeGeometry(1, 1, 30);
	var material = new THREE.MeshBasicMaterial();
	
	var bullet = new THREE.Mesh(geometry, material);
	
	bullet.username = username;
	bullet.position.x = position.x;
	bullet.position.y = position.y + 10;
	bullet.position.z = position.z;
	bullet.rotation.y = rotation;
	
	bullet.scale.x = 1;
	bullet.scale.y = 1;
	bullet.scale.z = 1;

	var xRot = position.x + Math.sin(rotation) * shifter + Math.cos(rotation) * shifter;
	var zRot = position.z + Math.cos(rotation) * shifter - Math.sin(rotation) * shifter;
	
	bullet.position.x = xRot;
	bullet.position.z = zRot;

	bullet._lifetime = 0;
	bullet.updateMatrix();
	
	return bullet;
}

function handleBullets(bullets, bots, players_online, delta, update_queue){
	
	bullets.forEach(function(bullet, index){
		if (bullet._lifetime > 2000) {
			bullets.splice(index, 1);
		}
		else {
			bullet.translateZ(-0.3030303030303030303030303030303);
			bullet._lifetime += delta;
			bots.forEach(function(bot, botIndex){
				if ((bot.id != bullet.username)&&(getDistance(bot, bullet)< 150)) {
					bot.health -= 5;
					if (bot.health < 0) {
						update_queue.push(
							{ instruction: { name: "kill", type: "bot", id: bot.id } }
						);
						bots.splice(botIndex, 1);		
					}
					else {
						update_queue.push(
							{ instruction: { name: "hit", type: "bot", id: bot.id } }
						);
					}
				}
			});
		}
	});
}

function updateBotsFromBuffer(bullets, delta, update_queue, bots, events, players_online, THREE, world_map) {
	bots.forEach(function(bot, index){
		if (players_online.length > 0) {

			var 	fire = 0,
					radian = .01744444444444444444444444444444,
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
						delta > 16
				) {
					fire = 1;
				}
				update_queue.push(
					{ instruction: { name: "move", type: "bot", details: { fire: fire, pX: tX.instruction, pY: tY.instruction * .7, pZ: tZ.instruction, rY: rY, id: bot.id } } }
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


