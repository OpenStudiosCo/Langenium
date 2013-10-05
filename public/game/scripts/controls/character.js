/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Character
	This contains input handlers for player characters
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var character = function() {
    this.enabled = false;
    this.camera = new THREE.PerspectiveCamera( 35, (client.winW / client.winH), 1, M * 2 );
    this.camera.position.z = 9;
    this.camera.position.y = 5;
    this.camera.rotation.x = -.5
    return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Event Binders
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

character.prototype.input = function (delta) {

	var details = { 
		socket_id: player.socket_id,
		moving: false,
		face: 'back',
		velocity: .5,
		radian: (Math.PI / 10) * delta,
		pZ: 0,
		pY: 0,
		rY: 0
	};
	
	if (keyboard.pressed("W")) {
		
		details.pZ = -details.velocity;
		details.moving = true;
		details.face = 'back';
	}
	if (keyboard.pressed("S")) {
		details.pZ = details.velocity;
		details.moving = true;
		details.face = 'front';
	}
	if (keyboard.pressed("A")) {
		details.rY = details.radian;
		details.moving = true;
		details.face = 'left';
	}
	if (keyboard.pressed("D")) {
		details.rY = -details.radian;
		details.moving = true;
		details.face = 'right';
	}
	if (keyboard.pressed("X")){
		controls.character.enabled = false;
		events.socket.emit('character_toggle');
	}

	if (details.moving == true) {
		events.socket.emit('move_character', details);	
	}
	else {
		objects.characters.collection.forEach(function(sprite){
			if (sprite.socket_id == events.socket.socket.sessionid) {
				sprite.moving = false;
			}
		});
		
		if (controls.character.camera.rotation.x != -.5 && (controls.camera_rotating == false || controls.mouse.changeX == false)) {
			if (controls.character.camera.rotation.x > -.5) {
				controls.character.camera.rotation.x -= delta / 1000;
			}
			if (controls.character.camera.rotation.x < -.5) {
				controls.character.camera.rotation.x *= .999;
			}
		}
		if (controls.character.camera.rotation.y != 0 && (controls.camera_rotating == false || controls.mouse.changeY == false)) {
			controls.character.camera.rotation.y *= .89;
		}
		if (controls.character.camera.rotation.z != 0 && (controls.camera_rotating == false || controls.mouse.changeX == false)) {
			controls.character.camera.rotation.z *= .89;
		}
	}
	return details;
};

character.prototype.move = function (data) {

	objects.characters.collection.forEach(function(sprite){

		if (sprite.socket_id == data.socket_id) {
			
			sprite.moving = data.moving;
			sprite.face = data.face;
			
			// move sub
			if (sprite.socket_id == player.socket_id) {
				sprite.rotation.y = parseFloat(data.rY);
			}
			else {
				sprite.rotation.y = client.camera.rotation.y;
			}

			if (data.pX != 0) {
				sprite.position.x = parseFloat(data.pX);
			}
			if (data.pZ != 0) {
				sprite.position.z = parseFloat(data.pZ);
			}
			
		}
		else {
			sprite.rotation.y = player.rotation.y;
		}


	});

};