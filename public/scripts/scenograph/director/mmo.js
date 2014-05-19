L.scenograph.director.mmo = function() {
	this.camera_state.zoom = 35;

	L.scenograph.director.camera.position.set(
		0, 
		10,
		L.scenograph.director.camera_state.zoom
	);	

	var skyGeo = new THREE.SphereGeometry(this.M / 2, 32, 64);

	var sky_materials = [ 
		new THREE.ShaderMaterial( {
			side: THREE.DoubleSide,
			uniforms: this.effects.cloud_uniforms,
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
	sky.position.y = 24600;
	this.scene.add(sky);

	var mirror = new THREE.Mirror( this.renderer, this.camera, { clipBias: 0.003, textureWidth: 1024, textureHeight: 1024, color: 0x777777 } );
	var plane = new THREE.Mesh(new THREE.PlaneGeometry( this.M * 4.5, this.M * 4.5 , 1, 1 ), mirror.material);
	plane.name = 'Ocean';
	plane.add(mirror);
	plane.material.side = THREE.DoubleSide;
	plane.material.transparent = true;
	
	plane.rotateX( - Math.PI / 2 );
	this.scene.add(plane);





	var mountain_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(500,500,500);
		mesh.position.set(5000, -50, -8000)
		mesh.frustrumCulled = false;	
		L.scenograph.director.scene.add(mesh);			
	}
	L.scenograph.objects.loadObject('/assets/models/terrain/mountain/island.js', mountain_cb);

	var ship_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(10,10,10);
		mesh.position.set(0, 15, 0)
		L.scenograph.director.scene.add(mesh);	
		mesh.add(L.scenograph.director.camera)
		
		var anim_obj = {
			animate: function(delta) {
				L.scenograph.director.move_ship(mesh);
			}
		}
		L.scenograph.director.animation_queue.push(anim_obj)
	}
	L.scenograph.objects.loadObject('/assets/models/ships/mercenary/valiant2.js', ship_cb);
	

		var animation_obj = {
		animate: function(delta) {
			L.scenograph.director.effects.cloud_uniforms.time.value += 0.0025 * L.scenograph.stats.time.delta;
			mirror.material.uniforms.time.value += 0.0005 * delta;
			mirror.render();
		}
	}

	L.scenograph.director.animation_queue.push(animation_obj)
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, this.M, 0 );
	this.scene.add(hemiLight);
}

L.scenograph.director.move_ship = function(ship) {
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