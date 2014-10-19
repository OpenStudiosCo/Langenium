/*
	scenograph
*/

var scenograph = function() {

	this.keyboard = new THREEx.KeyboardState();
	this.winW = 1024;
	this.winH = 768;

	this.animation_queue = [];
	this.scene_variables = {};
	this.camera = null;
	this.camera_state = {
		rotating: false,
		zoom: 35
	};
	this.cursor = {
		position: {},
		leftClick: false
	};
	this.scene = null;
	this.renderer = null;
	this.controls = null;
	this.M = 500000;
	this.duration = 150;
	this.keyframes = 5;
	this.projector = new THREE.Projector();
	this.interpolation = this.duration / this.keyframes

	this.renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});

	this.renderer.setSize( this.winW, this.winH );
	document.body.appendChild( this.renderer.domElement );
	
	this.camera = new THREE.PerspectiveCamera( 45, this.winW / this.winH, 1, this.M * 2 );

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

	$(document).bind("mousemove", function(event) {
		L.scenograph.cursor.position = new THREE.Vector3( 
			( event.clientX / window.innerWidth ) * 2 - 1, 
			- ( event.clientY / window.innerHeight ) * 2 + 1, 
			1 );
	});

	$(document).bind("mouseup", function(event) {
		L.scenograph.cursor.leftClick = true;
	});

	$(window).resize(function(event) {
		 L.scenograph.onWindowResize();
	});

	this.updateWindowVariables = function(){
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
	};

	this.onWindowResize();

	return this;

}

scenograph.prototype._init = function() {
	L.scenograph = new scenograph();
}


scenograph.prototype.onWindowResize = function() {

	this.updateWindowVariables();

	this.camera.aspect = this.winW / this.winH;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize( this.winW, this.winH );

}

scenograph.prototype.animate = function() {
	if (L.director.options.paused == false) {
		L.scenograph.stats.update();
		if (L.director.options.hideInterface == true && $('#container').is(":visible") == true) {
			$('#container').slideUp();
		}
		if (L.director.options.hideInterface == false && $('#container').is(":visible") == false) {
			$('#container').slideDown();
		}
		if (L.director.options.activeScene != L.director.options.currentScene) {
			
			L.scenograph.clear();
			
			switch(L.director.options.activeScene) {
				case 'Epoch Exordium':
					epochexordium.prototype._init();
					L.director.options.currentScene = 'Epoch Exordium';
					break;
				case 'MMO':
					mmo.prototype._init();
					L.director.options.currentScene = 'MMO';
					break;
				case 'MMO Title':
					mmo_title.prototype._init();
					L.director.options.currentScene = 'MMO Title';
					break;
				case 'Character Test':
					character_test.prototype._init();
					L.director.options.currentScene = 'Character Test';
					break;
				case 'Sandbox':
					sandbox.prototype._init();
					L.director.options.currentScene = 'Sandbox';
					break;
			}
			
		}
		if (L.scenograph.scene) {
			L.scenograph.effects.logo_water_uniforms.time.value += 0.00001 * L.scenograph.stats.time.delta;
			L.scenograph.effects.sun_uniforms.time.value += 0.005 * L.scenograph.stats.time.delta;

			if (L.director.options.useControls == false) {		
				var newtime = L.scenograph.stats.time.now * 0.00005;
				L.scenograph.camera.position.set(
					L.scenograph.camera_state.zoom * Math.cos(newtime), 
					L.scenograph.camera_state.zoom,
					L.scenograph.camera_state.zoom * Math.sin(newtime))			
				L.scenograph.camera.lookAt(new THREE.Vector3(0,0,0))
			}
			else {
				if (L.scenograph.controls == null) {
					L.scenograph.controls = new THREE.OrbitControls( L.scenograph.camera, L.scenograph.renderer.domElement );
				}
				L.scenograph.controls.update();
			}

			if (L.scenograph.animation_queue.length > 0) {
				for (var i = 0; i < L.scenograph.animation_queue.length; i++) {
					L.scenograph.animation_queue[i].animate(L.scenograph.stats.time.delta)
				}
			}
			// This needs to go in a controls thing
			L.scenograph.cursor.leftClick = false;
			L.scenograph.renderer.render( L.scenograph.scene, L.scenograph.camera );
		}
		
		requestAnimationFrame( L.scenograph.animate );	
	}
	
}

scenograph.prototype.clear = function() {

	this.animation_queue = [];

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 45, L.scenograph.winW / L.scenograph.winH, 1, this.M * 2 );
	this.camera_state.zoom = 35;
	this.scene_variables = {};
	if (this.controls) {
		
		this.controls = new THREE.OrbitControls( L.scenograph.camera, L.scenograph.renderer.domElement );
	}
	$('#scene_stats').html('');
}

