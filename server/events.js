module.exports.movePlayer = movePlayer;

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Movement and location
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

function movePlayer(rotationY, data) {
	var velocityChange = 600 * data.d;
	var rotateAngle = .045;
	var retval;
	var velocity = 0;
	
	if (data.pZ > 0) { velocity = -velocityChange; } 				// forward
	if (data.pZ < 0) { velocity = velocityChange / 4; }			// back
	if (data.rY > 0) { data.rY = rotateAngle; }						// left
	if (data.rY < 0) { data.rY = -rotateAngle; }					// right
	if (data.pY > 0) { data.pY = velocityChange / 2; } 			// up
	if (data.pY < 0) { data.pY = -(velocityChange / 2); } 		// down
		
	data.rY = (data.rY + data.rY * Math.PI / 180);

	data.pX = velocity * Math.sin(rotationY);
	data.pZ = velocity * Math.cos(rotationY);
	
	retval = { instruction: { name: "move", details: data } };
	
	return retval;
}

// This is what mimics AI path movement
function moveTarget(target, key) {
	
}

function detectCollision(position1, position2) {
	var collision_distance = 300,
		distance = Math.sqrt((position1.x-position2.x)^2 + (position1.y-position2.y)^2 + (position1.z-position2.z)^2);
	if (distance <= collision_distance) { return true; }
	else { return false; }
}