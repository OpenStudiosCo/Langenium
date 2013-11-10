  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Water
	This class defines the water
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var water = function() {
	this.water_tiles = [];

	this.mirror;

	var waterTexture = THREE.ImageUtils.loadTexture( "/game/assets/textures/water2.jpg" );
	waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;
	// multiplier for distortion speed 		
	var baseSpeed = 0.0012;
	// number of times to repeat texture in each direction
	var repeatS = repeatT = 4.0;

	var noiseTexture = THREE.ImageUtils.loadTexture( "/game/assets/textures/noise.png" );
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 
	// magnitude of noise effect
	var noiseScale = .5;
	
	// texture to additively blend with base image texture
	var blendTexture = new THREE.ImageUtils.loadTexture( '/game/assets/textures/water2.jpg' );
	blendTexture.wrapS = blendTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 
	var blendSpeed = 0.001;
	// adjust lightness/darkness of blended texture
	var blendOffset = 0.25;

	// texture to determine normal displacement
	var bumpTexture = noiseTexture;
	bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
	// multiplier for distortion speed 		
	var bumpSpeed   = .0015;
	// magnitude of normal displacement
	var bumpScale   = 400.0;

	this.uniforms = {	
						baseTexture: 	{ type: "t", value: waterTexture },
						baseSpeed:		{ type: "f", value: baseSpeed },
						repeatS:		{ type: "f", value: repeatS },
						repeatT:		{ type: "f", value: repeatT },
						noiseTexture:	{ type: "t", value: noiseTexture },
						noiseScale:		{ type: "f", value: noiseScale },
						blendTexture:	{ type: "t", value: blendTexture },
						blendSpeed: 	{ type: "f", value: blendSpeed },
						blendOffset: 	{ type: "f", value: blendOffset },
						bumpTexture:	{ type: "t", value: bumpTexture },
						bumpSpeed: 		{ type: "f", value: bumpSpeed },
						bumpScale: 		{ type: "f", value: bumpScale },
						alpha: 			{ type: "f", value: 0.85 },
						time: 			{ type: "f", value: 1.0 }
					};

	return this;
};

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Main

water.prototype.makeWater = function(M, pos) {
	
	var 	water_res = 1;
		
	var geometry = new THREE.PlaneGeometry( M, M , water_res, water_res );	
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	var material = new THREE.ShaderMaterial( {
		uniforms: effects.water.uniforms,
		vertexShader:   document.getElementById( 'water_vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'water_fragmentShader' ).textContent

	} );

	material.side = THREE.DoubleSide;
	material.transparent = true;

	var plane = new THREE.Mesh( geometry, material );
	plane.name = "ocean";
	plane.frustrumCulled = false;	

	if (effects.water.water_tiles.length == 0) {
		effects.water.mirror = new THREE.Mirror( engine.renderer, client.camera, { clipBias: 0.003, textureWidth: client.winW, textureHeight: client.winH, color: 0x777777 } );
		plane.add(effects.water.mirror)
	}

	return plane;
};

water.prototype.makeEnvScale = function() {
	var env_scale = 10000;
	
	if (player) {
		env_scale = new THREE.Vector3().getPositionFromMatrix(player.matrixWorld).y;
	}

	env_scale = Math.floor(env_scale / (9980 + effects.water.water_tiles.length * effects.water.water_tiles.length * effects.water.water_tiles.length));
	
	return env_scale;
}

water.prototype.animate = function(delta) {
	effects.water.uniforms.time.value += delta;
	effects.water.mirror.material.uniforms.time.value += delta;
}

water.prototype.update = function() {
	
	var 	env_scale = effects.water.makeEnvScale(),
			water_length = effects.water.water_tiles.length,
			scale_multiplier = env_scale + 1, // to account for the coordinates in the excel sheet when multiplying the tiles and check previous scale
			expected_tile_count = 1;

	for (var scale = 1; scale < scale_multiplier; scale++) {
		expected_tile_count += 8;
	}
	expected_tile_count += scale_multiplier * 8;

	//console.log("env_scale: "+ env_scale + " exp: " + expected_tile_count + " scale_multiplier: " + scale_multiplier+ " water: " + water.length);
	
	if (effects.water.water_tiles.length < expected_tile_count) { 	
		if (effects.water.water_tiles.length == 1) {
			for (var i = 0; i < scale_multiplier; i++) {
				effects.water.addTiles(i, expected_tile_count);
			}
		}
		else {
			effects.water.addTiles(scale_multiplier, expected_tile_count);
		}
	}
}
 
 water.prototype.addTiles = function(env_scale, expected_tile_count){
	var pos = new THREE.Vector3(0,0,0);
	
	if (player) {
		pos = new THREE.Vector3().getPositionFromMatrix(player.matrixWorld);
	}
	
	var 	tile_array = [],
			tile_count = (env_scale * 2),
			x =  pos.x,
			z = pos.z;
			
	 for (var side = 1; side <= 4; side++) {

		for (var tile_index = 1; tile_index <= tile_count; tile_index++) {

			var	x_mod = M , 
					z_mod = M ;
			
			if (side == 1) { 
				if (tile_index <= tile_count / 2) {
					x_mod *= tile_index - 1;
					z_mod *= env_scale;
				}
				else {
					x_mod *= env_scale;
					z_mod *= tile_index - env_scale;
				}
			}
			if (side == 2) {
				if (tile_index <= tile_count / 2) {
					x_mod *= env_scale;
					z_mod *= -tile_index + 1;
				}
				else {
					x_mod *= tile_index - env_scale;
					z_mod *= -env_scale;
				}
			}
			if (side == 3) {
				if (tile_index <= tile_count / 2) {
					x_mod *= -tile_index + 1;
					z_mod *= -env_scale;
				}
				else {
					x_mod *= -env_scale;
					z_mod *= -(tile_index - env_scale);
				}
			}
			if (side == 4) {  
				if (tile_index <= tile_count / 2) {
					x_mod *= -env_scale;
					z_mod *= tile_index - 1;
				}
				else {
					x_mod *= -(tile_index - env_scale);
					z_mod *= env_scale;
				}
			}
			
			var tile = new effects.water.makeWater(M, pos);
			tile.position.ox = x_mod;
			tile.position.oz = z_mod;
			tile.position.x =  x_mod; 
			tile.position.z =  z_mod;
	
			
			tile_array.push(tile);
		}
	 }

	tile_array.forEach(function(tile){
		effects.water.water_tiles.push(tile);
		engine.scene.add(effects.water.water_tiles[effects.water.water_tiles.length-1]);
	});

 };