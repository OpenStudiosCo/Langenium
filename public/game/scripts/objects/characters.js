  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Characters
	This class defines character objects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var characters = function() {
	
	this.mercenary = {
    	texture_url: '/game/assets/textures/sprites/mercenary.png'
    };

    return this;
}

characters.prototype.make = function (character) {
	var charTexture = new THREE.ImageUtils.loadTexture( character.texture_url );
	var material = new THREE.MeshBasicMaterial( { map: charTexture, transparent: true, side:THREE.DoubleSide } );
	var geometry = new THREE.PlaneGeometry(500, 500, 1, 1);

	var new_character = new THREE.Mesh(geometry, material);
	new_character.animation = new textures.sprites.make( charTexture, 12, 1, 12, 120 ); // texture, #horiz, #vert, #total, duration.
	new_character.position.set(player.position.x,player.position.y,player.position.z);

	textures.sprites.animation_queue.push(new_character);

	scene.add(new_character);
}