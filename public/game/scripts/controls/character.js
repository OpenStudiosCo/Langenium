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
    this.camera = new THREE.PerspectiveCamera( 45, (client.winW / client.winH), 1, M / 3 * 2 );
    this.camera.position.z = 100;
    this.camera.position.y = 5;
    return this;
}

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


	events.socket.emit('move_character', details);
	
	return details;

};
character.prototype.move = function (data) {
	objects.characters.collection.forEach(function(sprite){
		if (sprite.socket_id == data.socket_id) {
			sprite.moving = data.moving;
			sprite.face = data.face;
			
			// move sub
			if (sprite.socket_id == player.socket_id) {
				sprite.rotation.y += data.rY;
			}
			else {
				sprite.rotation.y = client.camera.rotation.y;
			}

			if (data.pZ != 0) {
				sprite.translateZ(data.pZ);
			}
		}


	});

};