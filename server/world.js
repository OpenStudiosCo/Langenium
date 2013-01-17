module.exports.makeWorld = makeWorld;
module.exports.updateWorld = updateWorld;

function makeWorld(db, bots, THREE) {
	var world_map = [];
	var map_builder = db.getDummyMap();
	map_builder.forEach(function(sceneObj, index){
		var  type = sceneObj.type,
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
				urlPrefix = "http://localhost:8080/",
				//urlPrefix = "http://langenium.com/play/", 
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
	return world_map;
};

function getDistance(position1, position2) {
	return Math.sqrt(
		((position1.position.x - position2.position.x) * (position1.position.x - position2.position.x)) + 
		((position1.position.y - position2.position.y) * (position1.position.y - position2.position.y)) + 
		((position1.position.z - position2.position.z) * (position1.position.z - position2.position.z))
	);
}

function getAngle(position1, position2) {
	var angle = Math.atan2(-(position1.position.x - position2.position.x), (position1.position.z - position2.position.z));
	angle *= 180 / Math.PI;
	return angle;
}

function updateWorld(update_queue, bots, events, players_online, THREE, world_map) {
	updateBotsFromBuffer(update_queue, bots, events, players_online, THREE, world_map);
	time = new Date();
	players_online.forEach(function(player){
		var 	playerMovement, 
				inputData;
		if (player.inputUpdates.length > 0) {
			inputData = player.inputUpdates.shift();
		}
		else {
			inputData = { d: 0, pZ: 0, pY: 0, rY: 0};
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

function updateBotsFromQueue(update_queue, bots, events, players_online, THREE, world_map) {
	bots.forEach(function(bot, index){
		if (players_online.length > 0) {
			if (bots[index].movement_queue.length > 0) {
				var movement = bots[index].movement_queue.shift();
				bots[index].position.y += movement.instruction.details.pY;
				bots[index].position.z += movement.instruction.details.pZ;
				bots[index].rotation.y += movement.instruction.details.rY;
				update_queue.push(movement);
			}
			else {
				var destination = new THREE.Vector3(players_online[0].position.x, players_online[0].position.y, players_online[0].position.z);	
				bots[index].movement_queue = events.moveBot(bots[index], destination, getDistance(players_online[0], bots[index]), getAngle(players_online[0], bots[index]), world_map);
			}
		}
		else {
			bots[index].movement_queue = [];
		}
	});
}

function updateBotsFromBuffer(update_queue, bots, events, players_online, THREE, world_map) {
	bots.forEach(function(bot, index){
		if (players_online.length > 0) {
			if ((bots[index].movement_buffer)&&
				((bots[index].movement_buffer.xBuffer != 0)||
				(bots[index].movement_buffer.yBuffer != 0)||
				(bots[index].movement_buffer.zBuffer != 0)||
				(bots[index].movement_buffer.yRotateBuffer != 0)
				))
			{
			var 	tX = 0, 
						tY = 0, 	
						tZ = 0, 
						rY = 0,
						radian = .045;
				
				if (bots[index].movement_buffer.yRotateBuffer != 0) {
					if (bots[index].movement_buffer.yRotateBuffer > bots[index].rotation.y) {
						if (bots[index].movement_buffer.yRotateBuffer > radian) {
							bots[index].rotation.y += radian;	rY += radian; 
							bots[index].movement_buffer.yRotateBuffer -= radian;
						}
						else {
							bots[index].rotation.y += bots[index].movement_buffer.yRotateBuffer;	
							rY += bots[index].movement_buffer.yRotateBuffer; 
							bots[index].movement_buffer.yRotateBuffer = 0;
						}
					}
					else {
						if (bots[index].movement_buffer.yRotateBuffer  < radian) {
							bots[index].rotation.y -= radian;	rY -= radian; 
							bots[index].movement_buffer.yRotateBuffer += radian;
						}
						else {
							bots[index].rotation.y -= bots[index].movement_buffer.yRotateBuffer;	
							rY -= bots[index].movement_buffer.yRotateBuffer; 
							bots[index].movement_buffer.yRotateBuffer = 0;
						}
					}
				}
				else {
					if (bots[index].movement_buffer.xBuffer != 0) {
						if (bots[index].movement_buffer.xBuffer > 0) {
							if (bots[index].movement_buffer.xBuffer > 6) 
								{	bots[index].position.x += 6;	tX += 6;	bots[index].movement_buffer.xBuffer -= 6;	}
							else 
								{	bots[index].position.x += bots[index].movement_buffer.xBuffer;	tX += bots[index].movement_buffer.xBuffer;	bots[index].movement_buffer.xBuffer = 0;	}
						}
						else { 
							if (bots[index].movement_buffer.xBuffer < -6) 
								{	bots[index].position.x -= 6;	tX -= 6;	bots[index].movement_buffer.xBuffer += 6;	}
							else 
								{	bots[index].position.x -= bots[index].movement_buffer.xBuffer;	tX -= bots[index].movement_buffer.xBuffer;	bots[index].movement_buffer.xBuffer = 0;	}
						}
					}
					if (bots[index].movement_buffer.yBuffer != 0) {
						if (bots[index].movement_buffer.yBuffer > 0) {
							if (bots[index].movement_buffer.yBuffer > 6) 
								{	bots[index].position.y += 6;	tY += 6;	bots[index].movement_buffer.yBuffer -= 6;	}
							else 
								{	bots[index].position.y += bots[index].movement_buffer.yBuffer;	tY += bots[index].movement_buffer.yBuffer;	bots[index].movement_buffer.yBuffer = 0;	}
						}
						else { 
							if (bots[index].movement_buffer.yBuffer < -6) 
								{	bots[index].position.y -= 6;	tY -= 6;	bots[index].movement_buffer.yBuffer += 6;	}
							else 
								{	bots[index].position.y -= bots[index].movement_buffer.yBuffer;	tY -= bots[index].movement_buffer.yBuffer;	bots[index].movement_buffer.yBuffer = 0;	}
						}
					}
					if (bots[index].movement_buffer.zBuffer != 0) {
						if (bots[index].movement_buffer.zBuffer > 0) {
							if (bots[index].movement_buffer.zBuffer > 6) 
								{	bots[index].position.z += 6;	tZ += 6;	bots[index].movement_buffer.zBuffer -= 6;	}
							else 
								{	bots[index].position.z += bots[index].movement_buffer.zBuffer;	tZ += bots[index].movement_buffer.zBuffer;	bots[index].movement_buffer.zBuffer = 0;	}
						}
						else { 
							if (bots[index].movement_buffer.zBuffer < -6) 
								{	bots[index].position.z -= 6;	tZ -= 6;	bots[index].movement_buffer.zBuffer += 6;	}
							else 
								{	bots[index].position.z -= bots[index].movement_buffer.zBuffer;	tZ -= bots[index].movement_buffer.zBuffer;	bots[index].movement_buffer.zBuffer = 0;	}
						}
					}
				}
				
					
				
				var fire = 0;
				var angle = getAngle(players_online[0], bots[index]);
				angle = angle / (180 / Math.PI);
				if (angle < 0) { angle += 2; }
				angle *= 180 / Math.PI;
				if ((angle < 15)&&(angle > -15))
				{
					fire = 1;
				}
				
				update_queue.push(
					{ instruction: { name: "move", type: "bot", details: { fire: fire, pX: tX, pY: tY, pZ: tZ, rY: rY, username: bots[index].username } } }
				);
			}
			else {
				var destination = new THREE.Vector3(players_online[0].position.x, players_online[0].position.y, players_online[0].position.z);	
				bots[index].movement_buffer = events.makeBotMovementBuffer(bots[index], destination, getAngle(players_online[0], bots[index]), getDistance(bots[index], players_online[0]));
			}
		}
	});
}



