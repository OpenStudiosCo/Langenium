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
    this.camera.position.y = 3;
    return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

character.prototype.input = function (delta) {
	var moving = false, face;
	var details = { 
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
		moving = true;
		face = 'back';
	}
	if (keyboard.pressed("S")) {
		details.pZ = details.velocity;
		moving = true;
		face = 'front';
	}
	if (keyboard.pressed("A")) {
		details.rY = details.radian;
		moving = true;
		face = 'left';
	}
	if (keyboard.pressed("D")) {
		details.rY = -details.radian;
		moving = true;
		face = 'right';
	}
	if (keyboard.pressed("X")){
		controls.character.enabled = false;
		events.socket.emit('character_toggle');
	}
	objects.characters.collection.forEach(function(sprite){
		if (sprite.socket_id == player.socket_id) {
			sprite.moving = moving;
			if (face)
				sprite.face = face;
			
			// move sub
			if (details.rY != 0) {
				sprite.rotation.y += details.rY;
			}
			if (details.pZ != 0) {
				sprite.translateZ(details.pZ);
			}
			
		}
	});

};
character.prototype.move = function (playerPosition, data) {

};