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

	var waterTexture = THREE.ImageUtils.loadTexture( "/game/assets/textures/water3.jpg" );
	waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;

	var noiseTexture = THREE.ImageUtils.loadTexture( "/game/assets/textures/noise.png" );
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 

	this.uniforms = {	
		baseTexture: 	{ type: "t", value: waterTexture },
		baseSpeed:		{ type: "f", value: 0.0012511 }, 		
		alpha: 			{ type: "f", value: 0.45 },
		time: 			{ type: "f", value: 0.0 },
		
		noiseTexture:	{ type: "t", value: noiseTexture },
		noiseScale:		{ type: "f", value: 0.0325337 }, 	
		
		noiseSpeed2: 	{ type: "f", value: .0000011152121 },
		noiseScale2: 	{ type: "f", value: 0.042134 },
		
		noiseSpeed3: 	{ type: "f", value: .000001315337 },
		noiseScale3: 	{ type: "f", value: 0.01121212 },
		
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
	plane = new THREE.Mesh(new THREE.PlaneGeometry( M * 2, M * 2 , 100, 100 ), effects.water.mirror.material);
	plane.add(effects.water.mirror);

	plane.name = "ocean";
	plane.material.side = THREE.DoubleSide;
	plane.material.opacity = 0.15;
	plane.material.transparent = true;
	plane.frustrumCulled = false;	
	plane.rotateX( - Math.PI / 2 );
	return plane;
};

water.prototype.animate = function(delta) {
	effects.water.uniforms.time.value += delta;
}

