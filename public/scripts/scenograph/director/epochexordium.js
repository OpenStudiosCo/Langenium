L.scenograph.director.epochexordium = function() {
	this.camera_state.zoom = 7500;
	L.scenograph.director.camera.position.set(
		L.scenograph.director.camera_state.zoom * Math.cos(0), 
		L.scenograph.director.camera_state.zoom,
		L.scenograph.director.camera_state.zoom * Math.sin(0))			
	L.scenograph.director.camera.lookAt(new THREE.Vector3(0,0,0))
	var light = new THREE.PointLight(0xffffff, 1, 0);
	light.position.set(0,0,0);
	this.scene.add(light);

	var geometry = new THREE.BoxGeometry( 1000000, 1000000, 1000000 );

	var texture_prefix = '/assets/textures/epoch-exordium_'
	var textures = [
		texture_prefix + 'right1.png',
		texture_prefix + 'left2.png',
		texture_prefix + 'top3.png',
		texture_prefix + 'bottom4.png',
		texture_prefix + 'front5.png',
		texture_prefix + 'back6.png'
	];

	var textureCube = THREE.ImageUtils.loadTextureCube( textures );
	textureCube.format = THREE.RGBFormat;

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;

	var material = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	} );

	mesh = new THREE.Mesh( geometry, material );
	mesh.name = 'Space Box';
	this.scene.add( mesh );

	// Using AU (Astronomical Unit x 1000 + 1000 for sun's size) for distance, proportion to Earth for others

	var scene_setup = {
		background: 'milkyway', // skybox
		objects: [
			{
				name: 'Sun',
				type: 'sun',
				radius: 1000, // units are AU
				position: {
					x: 0,	y: 0,	z: 0
				}
			},
			{
				name: 'Mercury',
				type: 'planet',
				radius: 3.82, // units are AU
				position: {
					x: 0,	y: 0,	z: 1387
				}
			},
			{
				name: 'Venus',
				type: 'planet',
				radius: 9.49, // units are AU
				position: {
					x: 0,	y: 0,	z: 1723
				}
			},
			{
				name: 'Earth',
				type: 'planet',
				radius: 10, // units are AU
				position: {
					x: 0,	y: 0,	z: 2000
				}
			},
			{
				name: 'Mars',
				type: 'planet',
				radius: 5.32, // units are AU
				position: {
					x: 0,	y: 0,	z: 2524
				}
			},
			{
				name: 'Jupiter',
				type: 'planet',
				radius: 111.9, // units are AU
				position: {
					x: 0,	y: 0,	z: 6203
				}
			},
			{
				name: 'Saturn',
				type: 'planet',
				radius: 92.6, // units are AU
				position: {
					x: 0,	y: 0,	z: 10529
				}
			},
			{
				name: 'Uranus',
				type: 'planet',
				radius: 40.1, // units are AU
				position: {
					x: 0,	y: 0,	z: 20190
				}
			},
			{
				name: 'Neptune',
				type: 'planet',
				radius: 38.8, // units are AU
				position: {
					x: 0,	y: 0,	z: 31060
				}
			},
			{
				name: 'Pluto',
				type: 'planet',
				radius: 1.8, // units are AU
				position: {
					x: 0,	y: 0,	z: 40530
				}
			},

		]
	};
  	for (var i = 0; i < scene_setup.objects.length; i++) {
  		switch(scene_setup.objects[i].type) {
  			case 'planet': 
  				this.scene.add(
  					this.make_sphere(
  						scene_setup.objects[i].name, 
  						scene_setup.objects[i].position, 
  						scene_setup.objects[i].radius)
  				);
  				break;
  			case 'sun':
  				this.scene.add(
  					this.make_sun(
  						scene_setup.objects[i].position,  
  						scene_setup.objects[i].radius)
  				);
  				break;
  			default:
  				console.log("Failed to load object:");
  				console.log(scene_setup.objects[i]);
  				break;
  		}
  	}
  	L.scenograph.director.animation_queue.push(new L.scenograph.director.select_planet());
}

L.scenograph.director.select_planet = function() {
	this.animate = function(delta) {
		if (L.scenograph.director.cursor.leftClick == true) {
			L.scenograph.director.projector.unprojectVector(L.scenograph.director.cursor.position, L.scenograph.director.camera);
			var raycaster = new THREE.Raycaster( L.scenograph.director.camera.position, L.scenograph.director.cursor.position.sub( L.scenograph.director.camera.position ).normalize() );	

			var intersects = raycaster.intersectObjects( L.scenograph.director.scene.children );
			if (intersects.length > 0) {
				if (intersects[0].object.name != 'Space Box' && 
					intersects[0].object.name != 'Sun Halo') {
					var vector = intersects[0].object.position.clone();
					L.scenograph.director.controls.target.set(
						vector.x,
						vector.y,
						vector.z
					);
				}
			}
		}
	}
	return this;
}

L.scenograph.director.make_sun = function(position, radius) {
	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: L.scenograph.director.effects.sun_uniforms,
		vertexShader:   document.getElementById( 'sunVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'sunFragShader' ).textContent,
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending
	}   );
	// Sphere parameters: radius, segments along width, segments along height
	
	var sphere = new THREE.Mesh( new THREE.SphereGeometry( radius, 32, 32 ), customMaterial );
	sphere.position.set(position.x, position.y, position.z);
	sphere.name = 'Sun'

	customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: {  },
		vertexShader:   document.getElementById( 'haloVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'haloFragShader' ).textContent,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	}   );
		
	var ballGeometry = new THREE.SphereGeometry( radius * 1.1, 32, 32 );
	var ball = new THREE.Mesh( ballGeometry, customMaterial );
	L.scenograph.director.scene.add( ball );
	ball.name = 'Sun Halo'

	return sphere;
}
L.scenograph.director.make_sphere = function(name, position, radius) {
	// Sphere parameters: radius, segments along width, segments along height
	var sphere = THREEx.Planets['create' + name]();
	sphere.name = name;

	if (name == 'Earth') {
		var clouds    = THREEx.Planets.createEarthCloud()
		clouds.position.set(position.x, position.y, position.z);		
		clouds.scale.set(radius * 1.01,radius* 1.01,radius* 1.01)
		L.scenograph.director.scene.add(clouds)
	}

	if (name == 'Saturn' || name == 'Uranus') {
		var mesh    = THREEx.Planets['create' +name+'Ring']();
		mesh.position.set(position.x, position.y, position.z);		
		mesh.scale.set(radius * 1.3,radius* 1.3,radius* 1.3)
		L.scenograph.director.scene.add(mesh)
	}

	sphere.position.set(position.x, position.y, position.z);
	sphere.scale.set(radius,radius,radius)
	
	return sphere;
}