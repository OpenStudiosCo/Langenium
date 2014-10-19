var mmo = function() {
	L.director.camera_state.zoom = 35;

	L.director.camera.position.set(
		0, 
		10,
		L.director.camera_state.zoom
	);	

	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, L.director.M, 0 );
	L.director.scene.add(hemiLight);

	var skyGeo = new THREE.SphereGeometry(L.director.M / 2, 32, 64);

	var sky_materials = [ 
		new THREE.ShaderMaterial( {
			side: THREE.DoubleSide,
			uniforms: L.director.effects.cloud_uniforms,
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
	L.director.scene.add(sky);

	var water = new THREE.Water( L.director.renderer, L.director.camera, L.director.scene, {
		textureWidth: 512, 
		textureHeight: 512,
		waterNormals: L.director.waterNormals,
		alpha: 	.8,
		sunDirection: hemiLight.position.normalize(),
		sunColor: 0xffffff,
		waterColor: 0x0066DD,
		distortionScale: 20.0,
		side: THREE.DoubleSide
	} );

	var plane = new THREE.Mesh(new THREE.PlaneGeometry( L.director.M * 4.5, L.director.M * 4.5 , 50, 50 ), water.material);
	plane.name = 'Ocean';
	plane.rotateX( - Math.PI / 2 );
	plane.add(water);
	L.director.scene.add(plane);

	var animation_obj = {
		animate: function(delta) {
			L.director.effects.cloud_uniforms.time.value += 0.0025 * L.scenograph.stats.time.delta;
			water.material.uniforms.time.value +=1.0 / 60.0;
			water.render();
		}
	}
	
	L.director.animation_queue.push(animation_obj)
	

	var mountain_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(500,500,500);
		mesh.position.set(5000, -50, -8000)
		mesh.frustrumCulled = false;	
		L.director.scene.add(mesh);			
	}
	L.scenograph.objects.loadObject('/res/models/terrain/mountain/island.js', mountain_cb);

	var ship_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(10,10,10);
		mesh.position.set(0, 15, 0)
		L.director.scene.add(mesh);	
		mesh.add(L.director.camera);

		/*
		//http://webgl-fire.appspot.com/html/fire.html
		var firetex = THREE.ImageUtils.loadTexture( "/assets/textures/firetex.png" );
		//firetex.wrapS = firetex.wrapT = THREE.RepeatWrapping;

		var nzw = THREE.ImageUtils.loadTexture( "/assets/textures/nzw.png" );
		//nzw.wrapS = nzw.wrapT = THREE.RepeatWrapping;

		var thruster_uniforms = {
			fireProfile: 	{ type: "t", value: firetex },
			nzw:			{ type: "t", value: nzw },
			time: 			{ type: "f", value: 0.0 },
			eye: 			{ type: "v3", value: new THREE.Vector3(0, 0, 0) }
		};

		var thruster_material = new THREE.ShaderMaterial({
			uniforms: thruster_uniforms,
			vertexShader:   document.getElementById( 'fireVertShader'   ).textContent,
			fragmentShader: document.getElementById( 'fireFragShader' ).textContent,
			side: THREE.DoubleSide
		});

		var thruster = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), thruster_material);

		mesh.add(thruster);
		*/

		var anim_obj = {
			animate: function(delta) {
				L.director.mmo.move_ship(mesh);
					var worldCoordinates = new THREE.Vector3();
					worldCoordinates.setFromMatrixPosition(L.director.camera.matrixWorld);
					//thruster_uniforms.eye.value = worldCoordinates;
					//thruster_uniforms.time.value += delta /1000;
			}
		}
		L.director.animation_queue.push(anim_obj)
	}
	L.scenograph.objects.loadObject('/res/models/ships/mercenary/valiant2.js', ship_cb);
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