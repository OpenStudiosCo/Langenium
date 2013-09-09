/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Scenes
	This contains the classes that manage scenes
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var scenes = function() {
	return this;
};

// move all scenes into here, including preview (might come in handy later)

// createPortal to enter, must be on an object with "portal slots" that are bound to sub-objects such as the hangar bay 

// load scene (based on instance settings)
// to the client there are only indoor and outdoor scenes (instances)

// scene explorer will need tags or something and search abilities

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

scenes.prototype.load = function(instance) {
	// create a new THREE.Scene and setup rendering callback in engine render block
	console.log(instance);
	// default to flight camera
	client.camera = controls.flight.camera;
	scene = new THREE.Scene();
	//scene.add(camera);
	
	var skyGeo = new THREE.CylinderGeometry(M / 2, M / 2, M, 64	, 64, false);

	var sky_materials = [ new THREE.MeshBasicMaterial({ 
			color: 0x66CCFF,
			shading: THREE.SmoothShading, 
			side: THREE.DoubleSide
		}),
		 new THREE.MeshBasicMaterial( { color: 0x002244, side: THREE.DoubleSide,  } )
		 ];
		 
	for ( var i = 0; i < skyGeo.faces.length; i++ ) 
	{
		if  (skyGeo.faces[ i ].centroid.y >  -16000) {
			skyGeo.faces[ i ].materialIndex = 0;
		}
		else {
			skyGeo.faces[ i ].materialIndex = 1;
		}
	}
	
	sky = new THREE.Mesh(skyGeo, new THREE.MeshFaceMaterial(sky_materials));
	sky.name = "sky";
	scene.add(sky);

	effects.water.water_tiles.push(new effects.water.makeWater(M));
	scene.add(effects.water.water_tiles[0]);
	scene.add(effects.water.textureCamera);
	effects.water.update();
	
	//effects.particles.cloudEffect({x: -24000, y: 40000, z: -24000});
	//effects.particles.cloudEffect({x: 0, y: 45000, z: 0});
		
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, M, 0 );
	scene.add( hemiLight );
	
};
