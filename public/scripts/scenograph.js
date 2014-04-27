L.scenograph = {
	winW: 1024,
	winH: 768,
	options: {
		activeScene: 'MMO',
		currentScene: '',
		hideInterface: true,
		scenes: [
			'EpochExordium',
			'MMO',
			'MMO-Title'
		],
		useControls: true
	},
	updateWindowVariables: function(){
		if (document.body && document.body.offsetWidth) {
			this.winW = document.body.offsetWidth;
			this.winH = document.body.offsetHeight;
		}
		if (document.compatMode=='CSS1Compat' &&
			document.documentElement &&
			document.documentElement.offsetWidth ) {
			this.winW = document.documentElement.offsetWidth;
			this.winH = document.documentElement.offsetHeight;
		} 
		if (window.innerWidth && window.innerHeight) {
			this.winW = window.innerWidth;
			this.winH = window.innerHeight;
		}
	}
};

L.scenograph.director = {
	camera: null,
	camera_state: {
		rotating: false,
		zoom: 35,
	},
	scene: null,
	renderer: null,
	controls: null,
	M: 500000,
	duration: 150,
	keyframes: 5,
	interpolation: this.duration / this.keyframes
};
	
L.scenograph.director.init = function() {
	L.scenograph.updateWindowVariables();
	this.renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	this.renderer.setSize( L.scenograph.winW, L.scenograph.winH );
	document.body.appendChild( this.renderer.domElement );
	
	window.addEventListener( 'resize', this.onWindowResize, false );

	this.camera = new THREE.PerspectiveCamera( 70, L.scenograph.winW / L.scenograph.winH, 1, this.M * 2 );

	this.noiseTexture2 = THREE.ImageUtils.loadTexture( "/assets/textures/noise2.jpg" );
	this.noiseTexture2.wrapS = this.noiseTexture2.wrapT = THREE.RepeatWrapping;
	
	this.noiseTexture3 = THREE.ImageUtils.loadTexture( "/assets/textures/noise3.jpg" );
	this.noiseTexture3.wrapS = this.noiseTexture3.wrapT = THREE.RepeatWrapping;

	this.effects = {
		cloud_uniforms: {
			noiseTexture:	{ type: "t", value: this.noiseTexture2 },
			scale: 			{ type: "f", value: 0.000001 },
			time: 			{ type: "f", value: 0.0 }
		},
		mirror: null,
		water_uniforms: {		
			noiseTexture:	{ type: "t", value: this.noiseTexture3 },
			time: 			{ type: "f", value: 0.0 },
			scale: 			{ type: "f", value: .00015337 },	
			mirrorSampler: 	{ type: "t", value: null },
			textureMatrix: 	{ type: "m4", value: new THREE.Matrix4() }
		},
		logo_water_uniforms: {
			noiseTexture:	{ type: "t", value: this.noiseTexture3 },
			time: 			{ type: "f", value: 0.0 }
		},
		logo_metal_uniforms: {
			noiseTexture:	{ type: "t", value: this.noiseTexture3 },
			time: 			{ type: "f", value: 0.0 }
		}
	};
	this.animate();
};

L.scenograph.director.mmo_title = function() {
	this.camera_state.zoom = 3500;
	this.scene = new THREE.Scene();

	var logoWaterMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: L.scenograph.director.effects.logo_water_uniforms,
		vertexShader:   document.getElementById( 'logoWaterVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'logoWaterFragShader' ).textContent,
		side: THREE.DoubleSide
	}   );

	var logoMetalMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: L.scenograph.director.effects.logo_metal_uniforms,
		vertexShader:   document.getElementById( 'logoMetalVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'logoMetalFragShader' ).textContent,
		side: THREE.DoubleSide
	}   );

	var logo_cb = function(geometry, materials) {
		
		for (var i = 0; i < materials.length; i++) {
			if(materials[i].name == 'Water') {
				materials[i] = logoWaterMaterial;
			}
			if (materials[i].name == 'Metal') {
				materials[i] = logoMetalMaterial;
			}
		}
		geometry.buffersNeedUpdate = true;
		geometry.uvsNeedUpdate = true;
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(2000,2000,2000);
		mesh.rotateX( Math.PI / 2 );
		L.scenograph.director.scene.add(mesh);			
	}
	L.scenograph.objects.loadObject('/assets/models/langenium-logo.js', logo_cb);
}

L.scenograph.director.mmo = function() {
	this.camera_state.zoom = 35;
	this.scene = new THREE.Scene();

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
		if  (skyGeo.faces[ i ].centroid.y >  -21000) {
			skyGeo.faces[ i ].materialIndex = 0;
		}
		else {
			skyGeo.faces[ i ].materialIndex = 1;
		}
	}
	
	var sky = new THREE.Mesh(skyGeo, new THREE.MeshFaceMaterial(sky_materials));
	sky.name = 'Skybox';
	sky.position.y = 25000;
	this.scene.add(sky);

	this.effects.mirror = new THREE.Mirror( this.renderer, this.camera, { clipBias: 0.003, textureWidth: L.scenograph.winW, textureHeight: L.scenograph.winH, color: 0x777777 } );
	var plane = new THREE.Mesh(new THREE.PlaneGeometry( this.M * 4.5, this.M * 4.5 , 1, 1 ), this.effects.mirror.material);
	plane.name = 'Ocean';
	plane.add(this.effects.mirror);
	plane.material.side = THREE.DoubleSide;
	plane.material.transparent = true;
	plane.frustrumCulled = false;	
	plane.rotateX( - Math.PI / 2 );
	this.scene.add(plane);

	var mountain_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(2000,2000,2000);
		L.scenograph.director.scene.add(mesh);			
	}
	L.scenograph.objects.loadObject('/assets/models/terrain/mountain/island.js', mountain_cb);

	var ship_cb = function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(10,10,10);
		mesh.position.set(-5000, 15000, -5000)
		L.scenograph.director.scene.add(mesh);	
		L.scenograph.director.camera.position.set(0, 0, 35);
		L.scenograph.director.camera.lookAt(0,0,0)
		mesh.add(L.scenograph.director.camera)
	}
	L.scenograph.objects.loadObject('/assets/models/ships/mercenary/valiant2.js', ship_cb);

	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, this.M, 0 );
	this.scene.add(hemiLight);
}

L.scenograph.director.epochexordium = function() {
	this.camera_state.zoom = 7500;
	this.scene = new THREE.Scene();
	var light = new THREE.PointLight(0xffffff, 1, 0);
	light.position.set(0,0,0);
	this.scene.add(light);

	var geometry = new THREE.CubeGeometry( 1000000, 1000000, 1000000 );

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
	// Sphere parameters: radius, segments along width, segments along height
	var sphere = new THREE.Mesh( new THREE.SphereGeometry( radius, 32, 16 ), new THREE.MeshBasicMaterial( { color: colour } ) );
	sphere.position.set(position.x, position.y, position.z);

	var customMaterial = new THREE.ShaderMaterial( 
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

L.scenograph.director.onWindowResize = function() {

	L.scenograph.updateWindowVariables();

	L.scenograph.director.camera.aspect = L.scenograph.winW / L.scenograph.winH;
	L.scenograph.director.camera.updateProjectionMatrix();

	L.scenograph.director.renderer.setSize( L.scenograph.winW, L.scenograph.winH );

}
				
L.scenograph.director.animate = function() {
	L.scenograph.stats.update();
	if (L.scenograph.options.hideInterface == true && $('#container').is(":visible") == true) {
		$('#container').slideUp();
	}
	if (L.scenograph.options.hideInterface == false && $('#container').is(":visible") == false) {
		$('#container').slideDown();
	}
	if (L.scenograph.options.activeScene != L.scenograph.options.currentScene) {
		switch(L.scenograph.options.activeScene) {
			case 'EpochExordium':
				L.scenograph.director.epochexordium();
				L.scenograph.options.currentScene = 'EpochExordium';
				break;
			case 'MMO':
				L.scenograph.director.mmo();
				L.scenograph.options.currentScene = 'MMO';
				break;
			case 'MMO-Title':
				L.scenograph.director.mmo_title();
				L.scenograph.options.currentScene = 'MMO-Title';
				break;
		}
	}
	if (L.scenograph.director.scene) {
		L.scenograph.director.effects.cloud_uniforms.time.value += 0.0025 * L.scenograph.stats.time.delta;
		L.scenograph.director.effects.water_uniforms.time.value += 0.001 * L.scenograph.stats.time.delta;
		L.scenograph.director.effects.logo_water_uniforms.time.value += 0.00001 * L.scenograph.stats.time.delta;


		if (L.scenograph.options.useControls == false) {		
			var newtime = L.scenograph.stats.time.now * 0.00005;
			L.scenograph.director.camera.position.set(
				L.scenograph.director.camera_state.zoom * Math.cos(newtime), 
				0, 
				L.scenograph.director.camera_state.zoom * Math.sin(newtime))			
			L.scenograph.director.camera.lookAt(new THREE.Vector3(0,0,0))
		}
		else {
			if (L.scenograph.director.controls == null) {
				L.scenograph.director.controls = new THREE.OrbitControls( L.scenograph.director.camera, L.scenograph.director.renderer.domElement );
			}
			L.scenograph.director.controls.update();
		}
		if (L.scenograph.director.effects.mirror) {
			L.scenograph.director.effects.mirror.render();
		}
		L.scenograph.director.renderer.render( L.scenograph.director.scene, L.scenograph.director.camera );
	}
	requestAnimationFrame( L.scenograph.director.animate );
}


