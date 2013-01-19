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
				//urlPrefix = "http://localhost:8080/",
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
	angle *= 180 / Math.PI ;
	return -angle;
}

function getTheta(position1, position2) {
	var theta = Math.atan2(-(position1.position.x - position2.position.x), (position1.position.z - position2.position.z));
	return Math.min(-theta);
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

function checkMovementBuffer(bufferObject) {
	if ((bufferObject.xBuffer != 0)||
		(bufferObject.yBuffer != 0)||
		(bufferObject.zBuffer != 0) )
	{ return true; }
	else { return false; }
}


function updateBotsFromBuffer(update_queue, bots, events, players_online, THREE, world_map) {
	bots.forEach(function(bot, index){
		if (players_online.length > 0) {

			var 	fire = 0,
					radian = Math.PI / 180;
					
			
			
			if (bots[index].movement_buffer&&
			(getDistance(bots[index], players_online[0]) - bots[index].movement_buffer.distance < 250)&&
			(checkMovementBuffer(bots[index].movement_buffer) == true))
			{
				var 	tX = events.moveBot(bots[index].movement_buffer.xBuffer), 
						tY = events.moveBot(bots[index].movement_buffer.yBuffer), 	
						tZ = events.moveBot(bots[index].movement_buffer.zBuffer),
						rY = 0;
		
				if  (((getTheta(bots[index], players_online[0]) > 0.1))||
				((getTheta(bots[index], players_online[0]) < -0.1)))  {
					if (bots[index].rotation.y  > getTheta(bots[index], players_online[0])) {
						if (bots[index].rotation.y - radian < getTheta(bots[index], players_online[0])) { }
						else { bots[index].rotation.y -= radian;	rY -= radian; }
					}
					else {
						if (bots[index].rotation.y + radian > getTheta(bots[index], players_online[0])) { }
						else { bots[index].rotation.y += radian;	rY+= radian; }
					}
				}
		
				if (tX.instruction != 0) { bots[index].position.x += tX.instruction; bots[index].movement_buffer.xBuffer = tX.buffer; }
				if (tY.instruction != 0) { bots[index].position.y += (tY.instruction)/2; bots[index].movement_buffer.yBuffer = tY.buffer - (tY.instruction)/2; }
				if (tZ.instruction != 0) { bots[index].position.z += tZ.instruction; bots[index].movement_buffer.zBuffer = tZ.buffer; }
				
				if ((getDistance(bots[index], players_online[0]) < 500) &&(getAngle(bots[index], players_online[0]) < 15)&&(getAngle(bots[index], players_online[0]) > -15)) {
					fire = 1;
				}
				update_queue.push(
					{ instruction: { name: "move", type: "bot", details: { fire: fire, pX: tX.instruction, pY: tY.instruction, pZ: tZ.instruction, rY: rY, username: bots[index].username } } }
				);
			}
			else {
				var destination = new THREE.Vector3(players_online[0].position.x, players_online[0].position.y, players_online[0].position.z);	
				bots[index].movement_buffer = events.makeBotMovementBuffer(bots[index], destination, getAngle(bots[index], players_online[0]), getDistance(bots[index], players_online[0]));
			}
		}
		else {
			if ((bots[index].movement_buffer)&&
				((bots[index].movement_buffer.xBuffer != 0)||
				(bots[index].movement_buffer.yBuffer != 0)||
				(bots[index].movement_buffer.zBuffer != 0))) {
					bots[index].movement_buffer.xBuffer = 0;
					bots[index].movement_buffer.yBuffer = 0;
					bots[index].movement_buffer.zBuffer = 0;
			}		
		}
	});
}



