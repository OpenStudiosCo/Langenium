L.scenograph.director.character_test = function() {
	// scene shit here
	console.log('Character test started')

	L.scenograph.director.camera_state.zoom = 500;
	L.scenograph.director.camera.position.set(
		0, 
		0,
		L.scenograph.director.camera_state.zoom
	);	
	var character = L.scenograph.director.make_character();
	this.scene.add(character);
	this.animation_queue.push(character.animation)

	// direction (normalized), origin, length, color(hex)
	var origin = new THREE.Vector3(0,-130,0);
	var arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), origin,200, 0xFFCC00);
	this.scene.add(arrow);

	var gridXZ = new THREE.GridHelper(100, 10);
	gridXZ.setColors( new THREE.Color(0x006600), new THREE.Color(0x006600) );
	gridXZ.position.set( 0,-150,0 );
	this.scene.add(gridXZ);
};

L.scenograph.director.make_character = function() {
	var texture = new THREE.ImageUtils.loadTexture( '/assets/exordium-male.png' );
	
	var material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, side:THREE.DoubleSide, alphaTest: 0.5 } );
	var geometry = new THREE.PlaneGeometry(12.5, 30.4);

	var new_character = new THREE.Mesh(geometry, material);
	new_character.direction = new THREE.Vector3(0,0,0);
	new_character.animation = new L.scenograph.director.make_animation( new_character, texture, 34, 1, 34, 3400 ); // texture, #horiz, #vert, #total, duration.
	new_character.scale.set(10,10,10);

	return new_character;
}

L.scenograph.director.make_animation = function( character, texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
	this.face = 'front';
	this.last_face = 'front';
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
		var tile_start = 0, tile_end = 7;
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
		if (this.face != this.last_face) {
			this.currentTile = tile_start;
			this.last_face = this.face;
		}

		character.lookAt(L.scenograph.director.camera.position);
		var diff = new THREE.Vector3().subVectors(character.position, L.scenograph.director.camera.position).normalize();
		if (diff.x < 0.6 && diff.x > -0.6) {
			this.face = 'front';
		}
		if (diff.x > 0.5 && diff.x < 0.8) {
			this.face = 'right';
		}
		if (diff.x < -0.5 && diff.x > -0.8) {
			this.face = 'left';
		}
		if (diff.z > 0.8) {
			this.face = 'back'
		}
		if (this.moving == true) {
			this.currentDisplayTime += delta * 25;
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