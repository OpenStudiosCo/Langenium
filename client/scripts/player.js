function playerInput(delta){
	var keyboardInput = { d: delta, pZ: 0, pY: 0, rY: 0, fire: isFiring },
			move = false;
	
	if (keyboard.pressed("W")){
		move = true;
		keyboardInput.pZ = 1;
	}
	if (keyboard.pressed("S")){
		move = true;
		keyboardInput.pZ = -1;
	}
	// rotate left/right
	if (keyboard.pressed("A")) {
		move = true;
		keyboardInput.rY = 1;
	}
	if (keyboard.pressed("D")) {
		move = true;
		keyboardInput.rY = -1;
	}
	if (keyboard.pressed(" ")) {
		move = true;
		keyboardInput.pY = 1;
	}
	if (keyboard.pressed("shift")){
		move = true;
		keyboardInput.pY = -1;
	}
	if (isFiring == true) {
		move = true;
	}
	
	if (move == true) {
		socket.emit('move', keyboardInput);
	}
	return keyboardInput;
}

function movePlayer(velocity, playerPosition, data) {

	var 		velocityYChange = 300 * data.d,
				rotateAngle = 0.01744444444444444444444444444444 * 2;

	if (data.rY > 0) { data.rY = rotateAngle; }						// left
	if (data.rY < 0) { data.rY = -rotateAngle; }					// right
	data.rY = (data.rY + data.rY * Math.PI / 180);
	
	if (data.pY > 0) { data.pY = velocityYChange; } 			// up
	if (data.pY < 0) { data.pY = -(velocityYChange); } 		// down

	data.rY += playerPosition.rotationY;
	data.pY += player.position.y;
	data.pX = playerPosition.x + velocity * Math.sin(player.rotation.y);
	data.pZ = playerPosition.z + velocity * Math.cos(player.rotation.y);
	
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
	
		moveShip(player, true, { name: "move", type: "player", details: data });

		$("#selectedItem").html("<div><strong>Player</strong><br />pX:&nbsp;"+player.position.x+"<br />pY:&nbsp;"+player.position.y+"<br />pZ:&nbsp;"+player.position.z+"<br />rY:&nbsp;"+player.rotation.y+"<br />d:&nbsp;" + Math.round(data.d * 1000) + "</div>");
}
