L.scenograph.director.other_water = function() {
	this.camera_state.zoom = 3500;

	L.scenograph.director.camera.position.set(
		0, 
		1000,
		L.scenograph.director.camera_state.zoom
	);	

	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, 100, 0 );
	this.scene.add(hemiLight);

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

	var water = new THREE.Water( L.scenograph.director.renderer, L.scenograph.director.camera, L.scenograph.director.scene, {
		textureWidth: 512, 
		textureHeight: 512,
		waterNormals: L.scenograph.director.waterNormals,
		alpha: 	.7,
		sunDirection: hemiLight.position.normalize(),
		sunColor: 0xffffff,
		waterColor: 0x001e1f,
		distortionScale: 150.0,
	} );

	var plane = new THREE.Mesh(new THREE.PlaneGeometry( this.M * 4.5, this.M * 4.5 , 50, 50 ), water.material);
	plane.name = 'Ocean';
	plane.rotateX( - Math.PI / 2 );
	plane.add(water);
	//water.material.side = THREE.DoubleSide;
	//plane.material.transparent = true;
	this.scene.add(plane);

	var animation_obj = {
		animate: function(delta) {
			water.material.uniforms.time.value +=1.0 / 60.0;
			water.render();
		}
	}
	
	L.scenograph.director.animation_queue.push(animation_obj)

	var plateau_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(100,100,100);
		mesh.position.set(1000, -50, 1000)
		mesh.frustrumCulled = false;	
		L.scenograph.director.scene.add(mesh);			
	}
	L.scenograph.objects.loadObject('/assets/models/terrain/plateau/large-angled.js', plateau_cb);
	
}