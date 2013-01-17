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

function updateWorld(update_queue, bots, events, players_online, THREE, world_map) {
	bots.forEach(function(bot, index){
		if (players_online.length > 0) {
			var player = players_online[0];
			var destination = new THREE.Vector3(player.position.x, player.position.y, player.position.z);	
			var 	deltaX = (players_online[0].position.x - bots[index].position.x),
					deltaY = (players_online[0].position.y - bots[index].position.y),
					deltaZ = (players_online[0].position.z - bots[index].position.z);

			var distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));
			var angle = Math.atan2(-deltaX, deltaZ);
			if (angle < 0) { angle += 2; }
			angle *= 180 / Math.PI;
			
			if (bot.movement_queue.length > 0) {
				var movement = bot.movement_queue.shift();
				bots[index].position.y += movement.instruction.details.pY;
				bots[index].position.z += movement.instruction.details.pZ;
				bots[index].rotation.y += movement.instruction.details.rY;
				update_queue.push(movement);
			}
			else {
				bots[index].movement_queue = events.moveBot(bots[index], destination, distance, angle, world_map);
			}
		}
		else {
			bots[index].movement_queue = [];
		}
	});
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




