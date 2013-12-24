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

	var noiseTexture = THREE.ImageUtils.loadTexture( "/assets/shared/textures/noise.jpg" );
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

	this.uniforms = {		
		noiseTexture:	{ type: "t", value: noiseTexture },
		time: 			{ type: "f", value: 0.0 },
		scale: 			{ type: "f", value: .00015337 },	
		mirrorColor: 	{ type: "c", value: new THREE.Color(0x7F7F7F) },
		mirrorSampler: 	{ type: "t", value: null },
		textureMatrix: 	{ type: "m4", value: new THREE.Matrix4() }
	}
	this.mirror;

	this.ocean;

	return this;
};

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Main

water.prototype.makeWater = function(M, pos) {
	
	var plane;
	
	effects.water.mirror = new THREE.Mirror( engine.renderer, client.camera, { clipBias: 0.003, textureWidth: client.winW, textureHeight: client.winH, color: 0x777777 } );
	plane = new THREE.Mesh(new THREE.PlaneGeometry( M * 4.5, M * 4.5 , 1, 1 ), effects.water.mirror.material);
	plane.add(effects.water.mirror);

	plane.name = "ocean";
	plane.material.side = THREE.DoubleSide;
	plane.material.transparent = true;
	plane.frustrumCulled = false;	
	plane.rotateX( - Math.PI / 2 );
	return plane;
};

water.prototype.animate = function(delta) {
	effects.water.uniforms.time.value += delta;
}

