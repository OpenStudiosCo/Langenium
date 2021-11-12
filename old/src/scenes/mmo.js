var mmo = function() {
	L.scenograph.camera_state.zoom = 35;

	L.scenograph.camera.position.set(
		0, 
		10,
		L.scenograph.camera_state.zoom
	);	

	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, L.scenograph.M, 0 );
	L.scenograph.scene.add(hemiLight);

	var skyGeo = new THREE.SphereGeometry(L.scenograph.M / 2, 32, 64);

	var sky_materials = [ 
		new THREE.ShaderMaterial( {
			side: THREE.DoubleSide,
			uniforms: L.scenograph.effects.cloud_uniforms,
			vertexShader:   document.getElementById( 'cloudVertShader'   ).textContent,
			fragmentShader: document.getElementById( 'cloudFragShader' ).textContent
		} ), 
		new THREE.MeshBasicMaterial( { color: 0x002244, side: THREE.DoubleSide  } )
	];
		 
	for ( var i = 0; i < skyGeo.faces.length; i++ ) 
	{
		if  (skyGeo.vertices[skyGeo.faces[ i ].a].y >  -21000) {
			skyGeo.faces[ i ].materialIndex = 0;
		}
		else {
			skyGeo.faces[ i ].materialIndex = 1;
		}

	}
	
	var sky = new THREE.Mesh(skyGeo, new THREE.MeshFaceMaterial(sky_materials));
	sky.name = 'Skybox';
	sky.position.y = 24475;
	L.scenograph.scene.add(sky);

	var water = new THREE.Water( L.scenograph.renderer, L.scenograph.camera, L.scenograph.scene, {
		textureWidth: 512, 
		textureHeight: 512,
		waterNormals: L.scenograph.waterNormals,
		alpha: 	.8,
		sunDirection: hemiLight.position.normalize(),
		sunColor: 0xffffff,
		waterColor: 0x0066DD,
		distortionScale: 20.0,
		side: THREE.DoubleSide
	} );

	var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry( L.scenograph.M , L.scenograph.M , 50, 50 ), water.material);
	plane.name = 'Ocean';
	plane.rotateX( - Math.PI / 2 );
	plane.add(water);
	L.scenograph.scene.add(plane);

	var animation_obj = {
		animate: function(delta) {
			L.scenograph.effects.cloud_uniforms.time.value += 0.0025 * delta;
			water.material.uniforms.time.value +=1.0 / 60.0;
			water.render();
		}
	}
	
	L.scenograph.animation_queue.push(animation_obj)
	

	var mountain_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(500,500,500);
		mesh.position.set(5000, -50, -8000)
		mesh.frustrumCulled = false;	
		L.scenograph.scene.add(mesh);			
	}
	L.scenograph.objects.loadObject('./res/models/terrain/mountain/island.js', mountain_cb);

	var ship_cb = function(geometry, materials) {
		for ( var i = 0; i < materials.length; i ++ ) {
			var m = materials[ i ];
			m.morphTargets = true;
		}

		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.name = 'Ship';
		mesh.scale.set(10,10,10);
		mesh.position.set(0, 15, 0);
		mesh.current_frame = 0;
		mesh.total_frames = 5;
		L.scenograph.scene.add(mesh);	

		mesh.add(L.scenograph.camera);

		var anim_obj = {
			animate: function(delta) {
				L.director.mmo.move_ship(mesh);
				
				if (mesh.current_frame < mesh.total_frames) {
					mesh.morphTargetInfluences[mesh.current_frame] = 0;
					mesh.current_frame += 1;
					mesh.morphTargetInfluences[mesh.current_frame] = 1;
				}
				else {
					mesh.morphTargetInfluences[mesh.current_frame] = 0;
					mesh.current_frame = 0;
					mesh.morphTargetInfluences[mesh.current_frame] = 0;
				}
				
			}
		}
		L.scenograph.animation_queue.push(anim_obj)
	}
	L.scenograph.objects.loadObject('./res/models/ships/mercenary/valiant.js', ship_cb);
	return this;
}

mmo.prototype._init = function() {
	L.director.mmo = new mmo();
}

mmo.prototype.move_ship = function(ship) {
	var stepSize = 10,
		pX = 0,
		pY = 0,
		pZ = 0,
		rY = 0, 
		tZ = 0, 
		tY = 0,
		radian = (Math.PI / 135);
	
	// Detect keyboard input
	if (L.scenograph.keyboard.pressed("W")) {
		tZ -= stepSize;
	}
	if (L.scenograph.keyboard.pressed("S")) {
		tZ += stepSize;
	}
	if (L.scenograph.keyboard.pressed("A")) {
		rY += radian;
	}
	if (L.scenograph.keyboard.pressed("D")) {
		rY -= radian;
	}
	if (L.scenograph.keyboard.pressed(" ")) {
		tY += stepSize * .6;
	}
	if (L.scenograph.keyboard.pressed("shift")) {
		tY -= stepSize * .6;
	}

	if (rY != 0) {
		ship.rotation.y += rY;
	}	

	ship.position.y += tY;

	ship.position.x += tZ * Math.sin(ship.rotation.y);
	ship.position.z += tZ * Math.cos(ship.rotation.y);
}