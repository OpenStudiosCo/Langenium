module.exports = function() {
	var scenograph = {};

	// All code below to be deprecated!
	// Scenograph class acts as an abstraction from THREE.JS and manages the drawing and visual logic of scenes (including collision detection) 
	// Scenograph can be applied on the server side to create that persistency/multiplayer layer

	scenograph.stats = {
		time: {
			now: Date.now(),
			delta: 0,
			deltaMin: Infinity,
			deltaMax: 0,
			last: 0
		},
		fps: {
			frames: 0,
			now: 0,
			min: Infinity,
			max: 0,
			last: Date.now()
		},
		update: function() {
			Ember.set('L.scenograph.stats.time.last', this.time.now);
			Ember.set('L.scenograph.stats.time.now', Date.now());
			Ember.set('L.scenograph.stats.time.delta', this.time.now - this.time.last);
			Ember.set('L.scenograph.stats.time.deltaMin', Math.min(this.time.deltaMin, this.time.delta));
			Ember.set('L.scenograph.stats.time.deltaMax', Math.max(this.time.deltaMax, this.time.delta));
			
			
			this.fps.frames++;
			if ( this.time.now > this.fps.last + 1000 ) {
				Ember.set('L.scenograph.stats.fps.now', Math.round( ( this.fps.frames * 1000 ) / ( this.time.now - this.fps.last ) ));
				Ember.set('L.scenograph.stats.fps.min', Math.min(this.fps.min, this.fps.now));
				Ember.set('L.scenograph.stats.fps.max', Math.max(this.fps.max, this.fps.now));
				Ember.set('L.scenograph.stats.fps.last', this.time.now);

				this.fps.frames = 0;
			}

		}
	};

	scenograph.options = {
		activeScene: 'EpochExordium',
		currentScene: 'EpochExordium',
		scenes: [
			'EpochExordium',
			'MMO'
		],
		useControls: false
	};

	scenograph.director = {
		camera: null,
		scene: null,
		renderer: null,
		controls: null
	};
	
	scenograph.director.init = function() {
		L.ember_app.ApplicationController = Ember.Controller.extend({
			fpsBinding: 'L.scenograph.stats.fps',
			timeBinding: 'L.scenograph.stats.time',
			optionsBinding: 'L.scenograph.options'
		});
		this.renderer = new THREE.WebGLRenderer({alpha: true});
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.renderer.domElement );
		
		this.scene = new THREE.Scene();

		window.addEventListener( 'resize', this.onWindowResize, false );


		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000000 );
		this.camera.position.z = 7000;
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

	    // Neptune
	    //L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z:  }, , 38.8 ));	
	    // Pluto
	    //L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z:  }, , 1.8 ));	

	}

	scenograph.director.make_sun = function(position, colour, radius) {
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
	scenograph.director.make_sphere = function(position, colour, radius) {
		// Sphere parameters: radius, segments along width, segments along height
		var sphere = new THREE.Mesh( new THREE.SphereGeometry( radius, 32, 16 ), new THREE.MeshPhongMaterial( { color: colour } ) );

		sphere.position.set(position.x, position.y, position.z);
		if (radius > 20)
			sphere.scale.set(3, 3, 3)
		else 
			sphere.scale.set(10, 10, 10)
		
		return sphere;
	}

	scenograph.director.onWindowResize = function() {

		L.scenograph.director.camera.aspect = window.innerWidth / window.innerHeight;
		L.scenograph.director.camera.updateProjectionMatrix();

		L.scenograph.director.renderer.setSize( window.innerWidth, window.innerHeight );

	}
				
	scenograph.director.animate = function() {
		L.scenograph.stats.update();
		if (L.scenograph.options.useControls == false) {		
			var newtime = L.scenograph.stats.time.now * 0.00005;
			L.scenograph.director.camera.position.set(11000 * Math.cos(newtime), 14000 * Math.sin(newtime), 14000 * Math.cos(0))
			
			L.scenograph.director.camera.lookAt(new THREE.Vector3(0,0,18000 * Math.sin(newtime)))
		}
		else {
			if (L.scenograph.director.controls == null) {
				L.scenograph.director.controls = new THREE.OrbitControls( L.scenograph.director.camera, L.scenograph.director.renderer.domElement );
			}
			L.scenograph.director.controls.update();
		}

		requestAnimationFrame( L.scenograph.director.animate );
		L.scenograph.director.renderer.render( L.scenograph.director.scene, L.scenograph.director.camera );

	}
	return scenograph;


};