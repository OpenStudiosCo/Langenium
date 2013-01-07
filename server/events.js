module.exports.movePlayer = movePlayer;
module.exports.moveBot = moveBot;

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Movement and location
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

var 	THREE = require('three');

function moveBot(delta, bot, world_map) {
	delta = delta || 10;
	var	moveDistance = -.3 * delta,
			tX = 0, tY = 0, tZ = 0, rY = 0; 			
	
	
	rY = Math.cos(delta/1000)/(Math.random() * 100 - 200);
	
	tX = moveDistance * Math.sin(bot.rotation.y + rY);
	tZ = moveDistance * Math.cos(bot.rotation.y + rY);
	tY = Math.cos(delta/1000)/(Math.random() * 100 - 200);
	
	var moveVector = new THREE.Vector3(tX, tY, tZ);
	var botPositionVector = new THREE.Vector3(bot.position.x, bot.position.y, bot.position.z);
	/******************************d******************************************************
	Commented this out for now as pathfinding AI will change when this is called (per target instead of per 15ms!!)
	*************************************************************************************
	var collisions = detectCollision(botPositionVector, moveVector, world_map);

	if (collisions.length > 0) {
		if (collisions[0].distance < 100) {
			if (bot.rotation.y > 0) 
				{ rY += collisions[0].distance / 10000; }
			if (bot.rotation.y < 0) 
				{ rY -= collisions[0].distance / 10000; }
			
			if (tX != 0) {
				tX *= -.001;
			}
			if (tY != 0) {
				tY *= -.001;
			}
			if (tZ != 0) {
				tZ *= -.001;
			}
		}   
	}
	************************************************************************************/
	bot.position.x += tX;
	bot.position.y += tY;
	bot.position.z += tZ;
	bot.rotation.y += rY;
	
	var data = { pX: tX, pY: tY, pZ: tZ, rY: rY, username: bot.username };
	//console.log(data);
		
	return { instruction: { name: "move", type: "bot", details: data } };

}

function movePlayer(velocity, playerPosition, world_map, data) {

	var 	velocityZChange = velocity,
			velocityYChange = 200 * data.d,
			rotateAngle = .045,
			retval;
	
	if (data.pZ > 0) { velocity = -velocityZChange; } 				// forward
	if (data.pZ < 0) { velocity = velocityZChange / 4; }			// back
	if (data.rY > 0) { data.rY = rotateAngle; }						// left
	if (data.rY < 0) { data.rY = -rotateAngle; }					// right
	if (data.pY > 0) { data.pY = velocityYChange; } 			// up
	if (data.pY < 0) { data.pY = -(velocityYChange); } 		// down

		
	data.rY = (data.rY + data.rY * Math.PI / 180);

	data.pX = velocityZChange * Math.sin(playerPosition.rotationY);
	data.pZ = velocityZChange * Math.cos(playerPosition.rotationY);
	
	var moveVector = new THREE.Vector3(data.pX, data.pY, data.pZ);
	var playerPositionVector = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
	
	var collisions = detectCollision(playerPositionVector, moveVector, world_map);

	if (collisions.length > 0) {
		collisions.forEach(function(collision, index){
			
			if (collision.distance < 90) {
		
				if (collision.point.x > playerPosition.x) 
					{ data.rY -= collision.distance / 10000; }
				if (collision.point.x < playerPosition.x) 
					{ data.rY += collision.distance / 10000; }
				
				if (data.pX != 0) {
					data.pX *= -.001;
				}
				if (data.pY != 0) {
					data.pY *= -.001;
				}
				if (data.pZ != 0) {
					data.pZ *= -.001;
				}
			}
		});
		
	}
	retval = { instruction: { name: "move", type: "player", details: data } };
	
	return retval;
}

function detectCollision(source, direction, world_map) {
	var raycaster = new THREE.Raycaster(source, direction.normalize());
	var intersects = raycaster.intersectObjects(world_map);
	return intersects;
}