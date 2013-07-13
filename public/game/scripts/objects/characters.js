  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Characters
	This class defines character objects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var characters = function() {
	this.collection = [];
	this.mercenary = {
    	texture_url: '/game/assets/textures/sprites/mercenary.png'
    };

    return this;
}

characters.prototype.make = function (socket_id, character, position) {
	var charTexture = new THREE.ImageUtils.loadTexture( character.texture_url );
	var material = new THREE.MeshBasicMaterial( { map: charTexture, transparent: true, side:THREE.DoubleSide, alphaTest: 0.5 } );
	var geometry = new THREE.PlaneGeometry(5, 5, 1, 1);

	var new_character = new THREE.Mesh(geometry, material);
	new_character.socket_id = socket_id;
	new_character.animation = new textures.sprites.make( charTexture, 12, 1, 12, 120 ); // texture, #horiz, #vert, #total, duration.
	new_character.position.set(position.x,position.y,position.z);
	new_character.face = 'front';



	if (socket_id == player.socket_id) {
		new_character.add(controls.character.camera);	
	}
	objects.characters.collection.push(new_character);
	textures.sprites.animation_queue.push(objects.characters.collection[objects.characters.collection.length-1]);

	scene.add(objects.characters.collection[objects.characters.collection.length-1]);
}

characters.prototype.remove = function (socket_id) {
	objects.characters.collection.forEach(function(character, index){
		if (character.socket_id == socket_id) {
			scene.remove(character);
			objects.characters.collection.splice(index, 1)
		}
	});
}