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
	this.scene.add( mesh );

	// Using AU (Astronomical Unit x 1000 + 1000 for sun's size) for distance, proportion to Earth for others

	var scene_setup = {
		background: 'milkyway', // skybox
		objects: [
			{
				name: 'Sun',
				type: 'sun',
				colour: 0xFDEE00,
				radius: 1000, // units are AU
				position: {
					x: 0,	y: 0,	z: 0
				}
			},
			{
				name: 'Mercury',
				type: 'planet',
				colour: 0x3D0C02,
				radius: 3.82, // units are AU
				position: {
					x: 0,	y: 0,	z: 1387
				}
			},
			{
				name: 'Venus',
				type: 'planet',
				colour: 0x915C83,
				radius: 9.49, // units are AU
				position: {
					x: 0,	y: 0,	z: 1723
				}
			},
			{
				name: 'Earth',
				type: 'planet',
				colour: 0x0033FF,
				radius: 10, // units are AU
				position: {
					x: 0,	y: 0,	z: 2000
				}
			},
			{
				name: 'Mars',
				type: 'planet',
				colour: 0xA52A2A,
				radius: 5.32, // units are AU
				position: {
					x: 0,	y: 0,	z: 2524
				}
			},
			{
				name: 'Jupiter',
				type: 'planet',
				colour: 0xB5A642,
				radius: 111.9, // units are AU
				position: {
					x: 0,	y: 0,	z: 6203
				}
			},
			{
				name: 'Saturn',
				type: 'planet',
				colour: 0xE3DAC9,
				radius: 92.6, // units are AU
				position: {
					x: 0,	y: 0,	z: 10529
				}
			},
			{
				name: 'Uranus',
				type: 'planet',
				colour: 0x0070FF,
				radius: 40.1, // units are AU
				position: {
					x: 0,	y: 0,	z: 20190
				}
			},
			{
				name: 'Neptune',
				type: 'planet',
				colour: 0x1974D2,
				radius: 38.8, // units are AU
				position: {
					x: 0,	y: 0,	z: 31060
				}
			},
			{
				name: 'Pluto',
				type: 'planet',
				colour: 0x91A3B0,
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
  						scene_setup.objects[i].position, 
  						scene_setup.objects[i].colour, 
  						scene_setup.objects[i].radius)
  				);
  				break;
  			case 'sun':
  				this.scene.add(
  					this.make_sun(
  						scene_setup.objects[i].position, 
  						scene_setup.objects[i].colour, 
  						scene_setup.objects[i].radius)
  				);
  				break;
  			default:
  				console.log("Failed to load object:");
  				console.log(scene_setup.objects[i]);
  				break;
  		}
  	}
}

L.scenograph.director.make_sun = function(position, colour, radius) {
	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: L.scenograph.director.effects.sun_uniforms,
		vertexShader:   document.getElementById( 'sunVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'sunFragShader' ).textContent,
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending
	}   );
	// Sphere parameters: radius, segments along width, segments along height
	
	var sphere = new THREE.Mesh( new THREE.SphereGeometry( radius, 32, 16 ), customMaterial );
	sphere.position.set(position.x, position.y, position.z);

	customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: {  },
		vertexShader:   document.getElementById( 'haloVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'haloFragShader' ).textContent,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	}   );
		
	var ballGeometry = new THREE.SphereGeometry( radius * 1.1, 32, 16 );
	var ball = new THREE.Mesh( ballGeometry, customMaterial );
	L.scenograph.director.scene.add( ball );

	return sphere;
}
L.scenograph.director.make_sphere = function(position, colour, radius) {
	// Sphere parameters: radius, segments along width, segments along height
	var sphere = new THREE.Mesh( new THREE.SphereGeometry( radius, 32, 16 ), new THREE.MeshPhongMaterial( { color: colour } ) );

	sphere.position.set(position.x, position.y, position.z);
	if (radius > 20)
		sphere.scale.set(3, 3, 3)
	else 
		sphere.scale.set(10, 10, 10)
	
	return sphere;
}