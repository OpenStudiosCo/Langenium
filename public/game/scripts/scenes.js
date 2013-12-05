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
	this.type;
	this.rooms = new rooms();
	this.grid = new grid();
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
	
	if (instance.environment == 'outdoor') {
		controls.flight.enabled = true;
		client.camera = controls.flight.camera;	
		
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
		engine.scene.add(sky);

/*

	Commented out for now:
		engine.scene.add(effects.clouds.make({
			x: 4220,
			y: 6280,
			z: -20000
		}));
		engine.scene.add(effects.clouds.make({
			x: 6220,
			y: 6280,
			z: -22000
		}));
*/
		engine.scene.add(effects.clouds.make({
			x: 0,
			y: 0,
			z: 0
		}));


		effects.water.ocean = effects.water.makeWater(M);

		engine.scene.add(effects.water.ocean )
	}	
	if (instance.environment == 'indoor') {
		controls.character.enabled = true;
		client.camera = controls.character.camera;
		if (client.is_editor) {
			scenes.grid.create();
		}
	}
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, M, 0 );
	engine.scene.add( hemiLight );
	
};
