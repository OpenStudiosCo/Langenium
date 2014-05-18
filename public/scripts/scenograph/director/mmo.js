L.scenograph.director.mmo = function() {
	this.camera_state.zoom = 3500;

	L.scenograph.director.camera.position.set(
		0, 
		1000,
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

	this.effects.mirror = new THREE.Mirror( this.renderer, this.camera, { clipBias: 0.003, textureWidth: 512, textureHeight: 512, color: 0x777777 } );
	var plane = new THREE.Mesh(new THREE.PlaneGeometry( this.M * 4.5, this.M * 4.5 , 1, 1 ), this.effects.mirror.material);
	plane.name = 'Ocean';
	plane.add(this.effects.mirror);
	plane.material.side = THREE.DoubleSide;
	plane.material.transparent = true;
	
	plane.rotateX( - Math.PI / 2 );
	this.scene.add(plane);

	
	var plateau_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(100,100,100);
		mesh.position.set(1000, -50, 1000)
		mesh.frustrumCulled = false;	
		L.scenograph.director.scene.add(mesh);			
	}
	L.scenograph.objects.loadObject('/assets/models/terrain/plateau/large-angled.js', plateau_cb);
	/*
	var ship_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(10,10,10);
		mesh.position.set(-5000, 15000, -5000)
		L.scenograph.director.scene.add(mesh);	
		L.scenograph.director.camera.position.set(-5000, 15000, -5035);
		L.scenograph.director.camera.lookAt(-5000, 15000, -5000)
		
	}
	L.scenograph.objects.loadObject('/assets/models/ships/mercenary/valiant2.js', ship_cb);
	*/
	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, this.M, 0 );
	this.scene.add(hemiLight);
}