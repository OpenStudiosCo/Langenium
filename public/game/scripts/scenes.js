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
	
	if (instance.type == 'outdoor') {
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

		effects.water.water_tiles.push(new effects.water.makeWater(M));
		engine.scene.add(effects.water.water_tiles[0]);
		engine.scene.add(effects.water.textureCamera);
		effects.water.update();
	}	
	if (instance.type == 'indoor') {
		controls.character.enabled = true;
		client.camera = controls.character.camera;
		if (client.is_editor) {
			var grid_geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
			var grid_material = new THREE.MeshBasicMaterial({ color: 0x333333, vertexColors: THREE.FaceColors});
				
			
			
			grid_geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

			scenes.grid = new THREE.Mesh(grid_geometry.clone(), grid_material);
			scenes.grid.position.y = -3;
			engine.scene.add(scenes.grid);

		}
	}
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, M, 0 );
	engine.scene.add( hemiLight );
	
};

// Scratch functions (place these somewhere smart later!)
// Draws the basic grid
function draw_grid () {
	var size = 1000; // creates 1000 cells by default
	var regions = {
		NW: { x: -1, y: 1 },
		NE: { x: 1, y: 1},
		SW: { x: -1, y: -1},
		SE: { x: 1, y: -1} 
	};

	for (var i = 0; i <= size; i++) {
		console.log("i:" + i);
		for (var r in regions){
			console.log("r:"+r);
			console.log(regions[r].x * i * 100)
			console.log(regions[r].y * i * 100)
		}
	}

}

