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

	var waterTexture = THREE.ImageUtils.loadTexture( "/game/assets/textures/water2.jpg" );
	waterTexture.repeat.set(12.0,12.0);
	waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;

	var noiseTexture = THREE.ImageUtils.loadTexture( "/game/assets/textures/noise.png" );
	waterTexture.repeat.set(4.0,4.0);
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 

	var noiseTexture2 = noiseTexture;
	noiseTexture2.wrapS = noiseTexture2.wrapT = THREE.RepeatWrapping; 

	var noiseTexture3 = noiseTexture;
	noiseTexture3.wrapS = noiseTexture3.wrapT = THREE.RepeatWrapping; 

	this.uniforms = {	
		baseTexture: 	{ type: "t", value: waterTexture },
		baseSpeed:		{ type: "f", value: 0.012511 }, 		
		alpha: 			{ type: "f", value: 0.95 },
		time: 			{ type: "f", value: 0.0 },
		
		noiseTexture:	{ type: "t", value: noiseTexture },
		noiseScale:		{ type: "f", value: 0.0325337 }, 	
		
		noiseTexture2:	{ type: "t", value: noiseTexture2 },
		noiseSpeed2: 	{ type: "f", value: .00152121 },
		noiseScale2: 	{ type: "f", value: 0.042134 },
		
		noiseTexture3:	{ type: "t", value: noiseTexture3 },
		noiseSpeed3: 	{ type: "f", value: .0015337 },
		noiseScale3: 	{ type: "f", value: 0.0121212 },
		
		mirrorColor: 	{ type: "c", value: new THREE.Color(0x7F7F7F) },
		mirrorSampler: 	{ type: "t", value: null },
		textureMatrix: 	{ type: "m4", value: new THREE.Matrix4() }
	}
	this.mirror;

	return this;
};

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Main

water.prototype.makeWater = function(M, pos) {
	
	var plane;
	
	effects.water.mirror = new THREE.Mirror( engine.renderer, client.camera, { clipBias: 0.003, textureWidth: client.winW, textureHeight: client.winH, color: 0x777777 } );
	plane = new THREE.Mesh(effects.water.makeGeometry(M, 1), effects.water.mirror.material);
	plane.add(effects.water.mirror);

	plane.name = "ocean";
	plane.material.side = THREE.DoubleSide;
	plane.material.opacity = 0.15;
	plane.material.transparent = true;
	plane.frustrumCulled = false;	
	plane.rotateX( - Math.PI / 2 );
	return plane;
};

water.prototype.makeGeometry = function(M, water_res) {
	var geometry = new THREE.PlaneGeometry( M * 2, M * 2 , water_res, water_res );	
	return geometry;
}

water.prototype.animate = function(delta) {
	effects.water.uniforms.time.value += delta;
}

