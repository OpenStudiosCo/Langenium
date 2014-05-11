L.scenograph.director.character_test = function() {
	// scene shit here
	console.log('Character test started')

	var character = L.scenograph.director.make_character();
	this.scene.add(character);
	this.animation_queue.push(character)

	// direction (normalized), origin, length, color(hex)
	var origin = new THREE.Vector3(0,-15,0);
	var terminus  = new THREE.Vector3(0,-15,75);
	var direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
	var arrow = new THREE.ArrowHelper(direction, origin, 50, 0x884400);
	this.scene.add(arrow);
};

L.scenograph.director.make_character = function() {
	var texture = new THREE.ImageUtils.loadTexture( '/assets/exordium-male.png' );
	
	var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, side:THREE.DoubleSide, alphaTest: 0.5 } );
	var geometry = new THREE.PlaneGeometry(1.25, 3.04, 1, 1);

	var new_character = new THREE.Mesh(geometry, material);
	new_character.animation = new L.scenograph.director.make_animation( texture, 34, 1, 34, 340 ); // texture, #horiz, #vert, #total, duration.
	new_character.face = 'front';
	new_character.scale.set(10,10,10);

	return new_character;
}

L.scenograph.director.make_animation = function(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
	this.face = 'front';
	this.moving = true;
	// take in some variables to create a sprite object
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

	this.animate = function(delta) {
		var tile_start = 0, tile_end = 2;
		switch(this.face) {
			case 'front':
				tile_start = 0;
				tile_end = 7;
				break;
			case 'back':
				tile_start = 8;
				tile_end = 15;
				break;
			case 'left':
				tile_start = 25;
				tile_end = 33;
				break;
			case 'right':
				tile_start = 16;
				tile_end = 24;
				break;
		}
		if (this.moving == true) {
			this.currentDisplayTime += delta * 1000;
			while (this.currentDisplayTime > this.tileDisplayDuration)
			{
				this.currentDisplayTime -= this.tileDisplayDuration;
				
				if (this.currentTile >= tile_end) {
					this.currentTile = tile_start;
				}
				else {
					this.currentTile++;
				}
				var currentColumn = this.currentTile % this.tilesHorizontal;
				texture.offset.x = currentColumn / this.tilesHorizontal;
				var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
				texture.offset.y = currentRow / this.tilesVertical;
			}
		}
		else {
			this.currentTile = tile_start + 1;
			var currentColumn = this.currentTile % this.tilesHorizontal;
				texture.offset.x = currentColumn / this.tilesHorizontal;
				var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
				texture.offset.y = currentRow / this.tilesVertical;
		}
		

	}
}

L.scenograph.director.animate_character = function(delta) {

}