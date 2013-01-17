module.exports.movePlayer = movePlayer;
module.exports.makeBotMovementBuffer = makeBotMovementBuffer;

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Movement and location
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

var 	THREE = require('three');

function makeBotMovementBuffer(bot, destination, angle, distance) {
	return { 
		xBuffer: distance * Math.sin(angle) ,
		yBuffer: destination.y - bot.position.y,
		zBuffer: distance * Math.cos(angle),
		yRotateBuffer: angle * Math.PI / 180
	}
}

function makeBotMovementArray(bot, destination, angle, distance) {

	var movementArray = [];
	var moveDistance = -6;

	var movements = distance / -moveDistance;
	
	for (var i = 1; i < movements; i++) {
			var rY = angle / (distance / -moveDistance) * .045;
			
			var rotationVariance = (rY* i);
			var tX, tY, tZ;
			
			if (angle > 0) {
				if (rotationVariance > angle) {
					rotationVariance = angle;
					rY = 0;
				}
				else {
					rotationVariance += bot.rotation.y;
				}
			}
			else {
				if (rotationVariance < angle) {
					rotationVariance = angle;
					rY = 0;
				}
				else {
					rotationVariance += bot.rotation.y;
				}
			}

			tX = moveDistance * Math.sin(rotationVariance);
			tY =  (destination.y - bot.position.y ) / (movements);
			tZ = moveDistance * Math.cos(rotationVariance);
					
			var data = { pX: tX, pY: tY, pZ: tZ, rY: rY, username: bot.username };
			
			var movement = { instruction: { name: "move", type: "bot", details: data } };
			
			movementArray.push(movement);

		}

	return movementArray;
}

function movePlayer(velocity, playerPosition, world_map, data) {

	var 	velocityZChange = velocity,
				velocityYChange = 200 * data.d,
				rotateAngle = .045,
				retval;

	if (data.rY > 0) { data.rY = rotateAngle; }						// left
	if (data.rY < 0) { data.rY = -rotateAngle; }					// right
	data.rY = (data.rY + data.rY * Math.PI / 180);
	
	if (data.pY > 0) { data.pY = velocityYChange; } 			// up
	if (data.pY < 0) { data.pY = -(velocityYChange); } 		// down

	
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