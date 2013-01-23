module.exports.movePlayer = movePlayer;
module.exports.makeBotMovementBuffer = makeBotMovementBuffer;
module.exports.moveBot = moveBot;
module.exports.detectCollision = detectCollision;


/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Movement and location
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

var 	THREE = require('three');

function makeBotMovementBuffer(bot, destination, angle, distance) {
	return { 
		xBuffer: distance * Math.sin(angle),
		yBuffer: destination.y - bot.position.y,
		zBuffer: distance * Math.cos(angle),
		distance: distance
	}
}
function moveBot(buffer) { 
	var instruction = 0;
	if (buffer != 0) {
		if (buffer > 0) {
			if (buffer > 6) 
				{	instruction += 6;	buffer -= 6;	}
			else 
				{	instruction += buffer;	buffer = 0;	}
		}
		else { 
			if (buffer < -6) 
				{	instruction -= 6;	buffer += 6;	}
			else 
				{	instruction -= buffer;	buffer = 0;	}
		}
	}
	return { instruction: instruction, buffer: buffer };
}

function movePlayer(velocity, playerPosition, world_map, data) {

	var 	velocityZChange = velocity,
				velocityYChange = 300 * data.d,
				rotateAngle = Math.PI * data.d,  // 0.01744444444444444444444444444444,
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