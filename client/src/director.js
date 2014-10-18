/*
	Director
*/

L.director = function() {
	L.scenograph.updateWindowVariables();
	this.renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});

	this.renderer.setSize( L.scenograph.winW, L.scenograph.winH );
	document.body.appendChild( this.renderer.domElement );
	
	window.addEventListener( 'resize', this.onWindowResize, false );

	this.camera = new THREE.PerspectiveCamera( 45, L.scenograph.winW / L.scenograph.winH, 1, this.M * 2 );

	this.noiseTexture2 = THREE.ImageUtils.loadTexture( "/res/textures/noise2.jpg" );
	this.noiseTexture2.wrapS = this.noiseTexture2.wrapT = THREE.RepeatWrapping;
	
	this.noiseTexture3 = THREE.ImageUtils.loadTexture( "/res/textures/noise3.jpg" );
	this.noiseTexture3.wrapS = this.noiseTexture3.wrapT = THREE.RepeatWrapping;

	this.waterNormals = new THREE.ImageUtils.loadTexture( '/res/textures/waternormals.jpg' );
	this.waterNormals.wrapS = this.waterNormals.wrapT = THREE.RepeatWrapping; 

	this.effects = {
		cloud_uniforms: {
			noiseTexture:	{ type: "t", value: this.noiseTexture2 },
			scale: 			{ type: "f", value: 0.000001 },
			time: 			{ type: "f", value: 0.0 }
		},
		mirror: null,
		water_uniforms: {		
			mirrorColor: { type: "c", value: new THREE.Color(0x7F7F7F) },
			noiseTexture:	{ type: "t", value: this.noiseTexture3 },
			time: 			{ type: "f", value: 0.0 },
			scale: 			{ type: "f", value: .00015337 },	
			mirrorSampler: 	{ type: "t", value: null },
			textureMatrix: 	{ type: "m4", value: new THREE.Matrix4() },
			eye:			{ type: "v3", value: new THREE.Vector3(0, 0, 0) }
		},
		logo_water_uniforms: {
			noiseTexture:	{ type: "t", value: this.noiseTexture3 },
			time: 			{ type: "f", value: 0.0 }
		},
		sun_uniforms: {
			noiseTexture:	{ type: "t", value: this.noiseTexture2 },
			time: 			{ type: "f", value: 0.0 }
		},
		logo_metal_uniforms: {
			noiseTexture:	{ type: "t", value: this.noiseTexture3 },
			time: 			{ type: "f", value: 0.0 }
		}
	};
	this.animate();

	$(document).bind("mousemove", function(event) {
		L.director.cursor.position = new THREE.Vector3( 
			( event.clientX / window.innerWidth ) * 2 - 1, 
			- ( event.clientY / window.innerHeight ) * 2 + 1, 
			1 );
	});

	$(document).bind("mouseup", function(event) {
		L.director.cursor.leftClick = true;
	});
}

L.director.prototype._init = function() {
	l.Director = new L.director();
}

L.director.prototype.clear = function() {

	
	L.scenograph.director.animation_queue = [];

	L.scenograph.director.scene = new THREE.Scene();
	L.scenograph.director.camera = new THREE.PerspectiveCamera( 45, L.scenograph.winW / L.scenograph.winH, 1, this.M * 2 );
	L.scenograph.director.camera_state.zoom = 35;
	L.scenograph.director.scene_variables = {};
	if (L.scenograph.director.controls) {
		
		L.scenograph.director.controls = new THREE.OrbitControls( L.scenograph.director.camera, L.scenograph.director.renderer.domElement );
	}
	$('#scene_stats').html('');
}

L.director.prototype.animate = function() {
	L.scenograph.stats.update();
	if (L.scenograph.options.hideInterface == true && $('#container').is(":visible") == true) {
		$('#container').slideUp();
	}
	if (L.scenograph.options.hideInterface == false && $('#container').is(":visible") == false) {
		$('#container').slideDown();
	}
	if (L.scenograph.options.activeScene != L.scenograph.options.currentScene) {
		this.clear();
		switch(L.scenograph.options.activeScene) {
			case 'Epoch Exordium':
				L.director.epochexordium();
				L.scenograph.options.currentScene = 'Epoch Exordium';
				break;
			case 'MMO':
				L.director.mmo();
				L.scenograph.options.currentScene = 'MMO';
				break;
			case 'MMO Title':
				L.director.mmo_title();
				L.scenograph.options.currentScene = 'MMO Title';
				break;
			case 'Character Test':
				L.director.character_test();
				L.scenograph.options.currentScene = 'Character Test';
				break;
			case 'Sandbox':
				L.scenograph.editor();
				L.scenograph.options.currentScene = 'Sandbox';
				break;
		}
	}
	if (L.director.scene) {
		L.director.effects.logo_water_uniforms.time.value += 0.00001 * L.scenograph.stats.time.delta;
		L.director.effects.sun_uniforms.time.value += 0.005 * L.scenograph.stats.time.delta;

		if (L.scenograph.options.useControls == false) {		
			var newtime = L.scenograph.stats.time.now * 0.00005;
			L.director.camera.position.set(
				L.director.camera_state.zoom * Math.cos(newtime), 
				L.director.camera_state.zoom,
				L.director.camera_state.zoom * Math.sin(newtime))			
			L.director.camera.lookAt(new THREE.Vector3(0,0,0))
		}
		else {
			if (L.director.controls == null) {
				L.director.controls = new THREE.OrbitControls( L.director.camera, L.director.renderer.domElement );
			}
			L.director.controls.update();
		}

		if (L.director.animation_queue.length > 0) {
			for (var i = 0; i < L.director.animation_queue.length; i++) {
				L.director.animation_queue[i].animate(L.scenograph.stats.time.delta)
			}
		}
		// This needs to go in a controls thing
		L.director.cursor.leftClick = false;
		L.director.renderer.render( L.director.scene, L.director.camera );
	}
	requestAnimationFrame( L.director.animate );
}

