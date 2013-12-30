/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Flight
	This contains input handlers for flying ships
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var flight = function() {
    
    this.camera = new THREE.PerspectiveCamera( 45, (client.winW / client.winH), 1, M * 2 );
    this.camera.position.y = 3;
	this.camera.position.z = 35;
	this.camera.fov = 70;

    this.enabled = false;

    return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Evemnt Binders
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

$(document).bind("mousedown", function(event) {
	if ((controls.flight && 
		controls.enabled == true && 
		controls.flight.enabled == true)) 
	{
		switch (event.which) {
			case 1:
				client.isFiring = true;
				break;
			case 2:
				// zoom IGNORE
				break;
			case 3:
				// rotate IGNORE
				break;
		}
	}

});
$(document).bind("mouseup", function(event) {
	if ((controls.flight && 
		controls.enabled == true && 
		controls.flight.enabled == true)) 
	{
		switch (event.which) {
			case 1:
				client.isFiring = false;
				break;
			case 2:
				// zoom IGNORE
				break;
			case 3:
				// rotate IGNORE
				break;
		}
	}
});

$(document).bind("contextmenu",function(){
    return false;
}); 

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


flight.prototype.input = function (delta){
	var keyboardInput = { d: delta, pZ: 0, pY: 0, rY: 0, fire: client.isFiring, client_position: player.position },
			move = false;
	
	if (keyboard.pressed("W")){
		if (player.velocity > -7.5) { player.velocity -= .75; }
		move = true;
		keyboardInput.pZ = 1;
	}
	if (keyboard.pressed("S")){
		if (player.velocity < 5) { player.velocity += .75; }
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
		if (player.position.y < 100000){														// <--------- these rules will need to go to the server
			move = true;																				// <--------- these rules will need to go to the server
			keyboardInput.pY = 1;																// <--------- these rules will need to go to the server
		}
	}
	if (keyboard.pressed("X")){
		controls.flight.enabled = false;
		events.socket.emit('character_toggle');
	}

	if (keyboard.pressed("shift")){
		if (player.position.y > -100000){ 														// <--------- these rules will need to go to the server
			move = true;																				// <--------- these rules will need to go to the server
			keyboardInput.pY = -1;																// <--------- these rules will need to go to the server
		}
	}
	
	if (client.isFiring == true) {
		move = true;
	}

	// ship is turning
	if (keyboardInput.rY != 0) {
		controls.camera_state.turning = true;

		if (client.camera.position.x < controls.mouse.camera_distance && 
			client.camera.position.x > -controls.mouse.camera_distance) {
			var x = keyboardInput.rY * Math.cos(delta * Math.PI / 180);
			client.camera.position.x -= x;
			client.camera.rotation.y -= x / 4;
		}
		if (client.camera.position.z < controls.mouse.camera_distance && 
			client.camera.position.z > -controls.mouse.camera_distance) {
			var z = keyboardInput.rY * Math.sin(delta * Math.PI / 180);
			client.camera.position.z -= z;
	
		}
	
	}
	else {
		if (controls.camera_state.turning == true) {
			var x = 0;
			var z = controls.mouse.camera_distance ;
			
			controls.flight.reset_xy = new TWEEN.Tween( {x: client.camera.position.x, y: client.camera.position.z })
				.to({x: x, y: z}, 350)
				.onUpdate(function(){
					if (controls.camera_state.turning == false &&
						controls.camera_state.rotating == false) {
						client.camera.position.x = this.x;
						client.camera.position.z = this.y;	
						
					}
					else {
						delete controls.flight.reset_xy;
					}
					client.camera.lookAt(new THREE.Vector3(0,0,0))
						client.camera.updateMatrix();
				})
				.onComplete(function(){
					delete controls.flight.reset_xy;
				})
				.start();
			
			controls.camera_state.turning = false;
		}
	}
	if (move == true) {
		client.camera.lookAt(new THREE.Vector3(0,0,0))
		events.socket.emit('game:scene:instance:input', keyboardInput);
	}
	client.camera.updateMatrix();

	
	
	return keyboardInput;
}


flight.prototype.move = function (velocity, playerPosition, data) {
	/*
		This is a client side function to move the world's water, check collisons and softly a ship, however the server response overrides this
	*/
	var velocityYChange = 22 * data.d,
		rotateAngle = 0.01744444444444444444444444444444 * 2;

	
	if (window.location.href.indexOf("editor") > 0) { 
		if (editor.sky_camera_active == true) {
			velocity *= 10 ; 
		}
		else {
			velocity *= 5 ; 
			velocityYChange *= 5;
		}
	}


	if (data.rY > 0) { data.rY = rotateAngle; }						// left
	if (data.rY < 0) { data.rY = -rotateAngle; }						// right
	data.rY = (data.rY + data.rY * Math.PI / 180);
	
	if (data.pY > 0) { data.pY = velocityYChange; } 			// up
	if (data.pY < 0) { data.pY = -(velocityYChange); } 		// down

	data.rY += player.rotation.y;
	data.pY += player.position.y;
	
	var 	diffX = velocity * Math.sin(player.rotation.y),
			diffZ = velocity * Math.cos(player.rotation.y);

	data.pX = playerPosition.x + diffX;
	data.pZ = playerPosition.z + diffZ;
		
	var moveVector = new THREE.Vector3(data.pX, data.pY, data.pZ);
	var playerPositionVector = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
	
	var collisions = events.detectCollision(playerPositionVector, moveVector, objects.world_map);
	
	if (collisions.length > 0) {
		collisions.forEach(function(collision, index){
			if (collision.distance < 90) {
		
				if (collision.point.x > playerPosition.x) 
					{ data.rY -= collision.distance / 10000; }
				if (collision.point.x < playerPosition.x) 
					{ data.rY += collision.distance / 10000; }
				
				if (data.pX != 0) {
					data.pX  = player.position.x + data.pX * -.001;
				}
				if (data.pY != 0) {
					data.pY = player.position.y;
				}
				if (data.pZ != 0) {
					data.pZ  = player.position.z + data.pZ * -.001;
				}
			}
		}); 
	}
	
	sky.position.x = data.pX;
	sky.position.z = data.pZ;
	
	var 	sky_scale = 1 + (player.position.y / 20000);
	
	
	// set sky scale
	if (sky_scale > 1) {
		sky.position.y =  24000 * (1 + (player.position.y / 20000));
		sky.scale.set(sky_scale,sky_scale,sky_scale);
	}
	
	
	sky.updateMatrixWorld();
	
	player.move(player, true, { details: data});
	

}
