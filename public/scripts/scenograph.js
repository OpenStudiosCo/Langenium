L.scenograph = {
	keyboard: new THREEx.KeyboardState(),
	winW: 1024,
	winH: 768,
	options: {
		activeScene: 'Character Test',
		currentScene: '',
		hideInterface: true,
		scenes: [
			'Epoch Exordium',
			'MMO',
			'MMO Title',
			'Character Test',
			'Sandbox',
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
	animation_queue: [],
	scene_variables: {},
	camera: null,
	camera_state: {
		rotating: false,
		zoom: 35,
	},
	cursor: {
		position: {},
		leftClick: false
	},
	scene: null,
	renderer: null,
	controls: null,
	M: 500000,
	duration: 150,
	keyframes: 5,
	projector: new THREE.Projector(),
	interpolation: this.duration / this.keyframes
};

L.scenograph.director.gui = new dat.GUI();
L.scenograph.director.gui.domElement.style.position = 'absolute';
L.scenograph.director.gui.domElement.style.top = '0px';
L.scenograph.director.gui.domElement.style.left = '20px';
L.scenograph.director.gui.domElement.style.paddingBottom = '22px';
L.scenograph.director.gui.onResize();

L.scenograph.director.clear = function() {

	L.scenograph.director.gui.destroy();
	L.scenograph.director.gui = new dat.GUI();
	L.scenograph.director.gui.domElement.style.position = 'absolute';
	L.scenograph.director.gui.domElement.style.top = '0px';
	L.scenograph.director.gui.domElement.style.left = '20px';
	L.scenograph.director.gui.domElement.style.paddingBottom = '22px';
	L.scenograph.director.gui.onResize();

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
	
L.scenograph.director.init = function() {
	L.scenograph.updateWindowVariables();
	this.renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});

	this.renderer.setSize( L.scenograph.winW, L.scenograph.winH );
	document.body.appendChild( this.renderer.domElement );
	
	window.addEventListener( 'resize', this.onWindowResize, false );

	this.camera = new THREE.PerspectiveCamera( 45, L.scenograph.winW / L.scenograph.winH, 1, this.M * 2 );

	this.noiseTexture2 = THREE.ImageUtils.loadTexture( "/assets/textures/noise2.jpg" );
	this.noiseTexture2.wrapS = this.noiseTexture2.wrapT = THREE.RepeatWrapping;
	
	this.noiseTexture3 = THREE.ImageUtils.loadTexture( "/assets/textures/noise3.jpg" );
	this.noiseTexture3.wrapS = this.noiseTexture3.wrapT = THREE.RepeatWrapping;

	this.waterNormals = new THREE.ImageUtils.loadTexture( '/assets/textures/waternormals.jpg' );
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
		L.scenograph.director.cursor.position = new THREE.Vector3( 
			( event.clientX / window.innerWidth ) * 2 - 1, 
			- ( event.clientY / window.innerHeight ) * 2 + 1, 
			1 );
	});

	$(document).bind("mouseup", function(event) {
		L.scenograph.director.cursor.leftClick = true;
	});
};

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
		L.scenograph.director.clear();
		switch(L.scenograph.options.activeScene) {
			case 'Epoch Exordium':
				L.scenograph.director.epochexordium();
				L.scenograph.options.currentScene = 'Epoch Exordium';
				break;
			case 'MMO':
				L.scenograph.director.mmo();
				L.scenograph.options.currentScene = 'MMO';
				break;
			case 'MMO Title':
				L.scenograph.director.mmo_title();
				L.scenograph.options.currentScene = 'MMO Title';
				break;
			case 'Character Test':
				L.scenograph.director.character_test();
				L.scenograph.options.currentScene = 'Character Test';
				break;
			case 'Sandbox':
				L.scenograph.director.sandbox();
				L.scenograph.options.currentScene = 'Sandbox';
				break;
		}
	}
	if (L.scenograph.director.scene) {
		L.scenograph.director.effects.logo_water_uniforms.time.value += 0.00001 * L.scenograph.stats.time.delta;
		L.scenograph.director.effects.sun_uniforms.time.value += 0.005 * L.scenograph.stats.time.delta;

		if (L.scenograph.options.useControls == false) {		
			var newtime = L.scenograph.stats.time.now * 0.00005;
			L.scenograph.director.camera.position.set(
				L.scenograph.director.camera_state.zoom * Math.cos(newtime), 
				L.scenograph.director.camera_state.zoom,
				L.scenograph.director.camera_state.zoom * Math.sin(newtime))			
			L.scenograph.director.camera.lookAt(new THREE.Vector3(0,0,0))
		}
		else {
			if (L.scenograph.director.controls == null) {
				L.scenograph.director.controls = new THREE.OrbitControls( L.scenograph.director.camera, L.scenograph.director.renderer.domElement );
			}
			L.scenograph.director.controls.update();
		}

		if (L.scenograph.director.animation_queue.length > 0) {
			for (var i = 0; i < L.scenograph.director.animation_queue.length; i++) {
				L.scenograph.director.animation_queue[i].animate(L.scenograph.stats.time.delta)
			}
		}
		// This needs to go in a controls thing
		L.scenograph.director.cursor.leftClick = false;
		L.scenograph.director.renderer.render( L.scenograph.director.scene, L.scenograph.director.camera );
	}
	requestAnimationFrame( L.scenograph.director.animate );
}


