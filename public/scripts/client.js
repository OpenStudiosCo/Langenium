(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
	var app = {
		name : "Langenium client application"
	};

	console.log("Client application ready")
	return app;
}


},{}],2:[function(require,module,exports){
module.exports = function() {
	var ember_app = Ember.Application.create({
		rootElement: '#container'
	});

	ember_app.Router.map(function(){
		this.resource('games');
		this.resource('about');
		this.resource('blog');
		this.resource('media');
	});

	ember_app.IndexRoute = Ember.Route.extend({
		model: function() {
			return ['red', 'yellow', 'blue'];
		}
	});

	ember_app.AboutRoute = Ember.Route.extend({
		model: function() {
			return ['severe', 'green', 'purple', 'severe'];
		}
	});

	return ember_app;
}
},{}],3:[function(require,module,exports){
(function (global){
// Initialize the Langenium client

// Load and initialize the Ember application
global.L = require('./L')()

L.ember_app = require('./ember_app')()

L.scenograph = require('./scenograph')()

L.scenograph.director.init(L);
L.scenograph.director.animate(L);
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L":1,"./ember_app":2,"./scenograph":4}],4:[function(require,module,exports){
module.exports = function() {
	var scenograph = {
		name: "HELLO! :D"
	};

	scenograph.director = {
		camera: {},
		scene: {},
		renderer: {},
		texture: {},
		controls: {}
	};
	
	scenograph.director.init = function(L) {

		L.scenograph.director.renderer = new THREE.WebGLRenderer({alpha: true});
		L.scenograph.director.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( L.scenograph.director.renderer.domElement );

		L.scenograph.director.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000000 );
		L.scenograph.director.camera.position.z = 4000;

		L.scenograph.director.scene = new THREE.Scene();

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
		L.scenograph.director.scene.add( mesh );

		window.addEventListener( 'resize', L.scenograph.director.onWindowResize, false );
		L.scenograph.director.controls = new THREE.OrbitControls( L.scenograph.director.camera, L.scenograph.director.renderer.domElement );

		 // Using AU (Astronomical Unit x 1000 + 1000 for sun's size) for distance, proportion to Earth for others
	    // Sun
	    L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 0 }, 0xFDEE00, 1000 ));	
	    // Mercury
	    L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 1387 }, 0x3D0C02, 3.82 ));	
	    // Venus
	    L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 1723 }, 0x915C83, 9.49 ));	
	    // Earth
	    L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 2000 }, 0x0033FF, 10 ));	
	    // Mars
	    L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 2524 }, 0xA52A2A, 5.32 ));	
	    // Jupiter
	    L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 6203 }, 0xB5A642, 111.9 ));	
	    // Saturn
	    L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 10529 }, 0xE3DAC9, 92.6 ));	
	    // Uranus
		L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 20190 }, 0x0070FF, 40.1 ));	
	    // Neptune
	    L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 31060 }, 0x1974D2, 38.8 ));	
	    // Pluto
	    L.scenograph.director.scene.add(L.scenograph.director.make_sphere({x: 0, y: 0, z: 40530 }, 0x91A3B0, 1.8 ));	

	}

	scenograph.director.make_sphere = function(position, colour, radius) {
		// Sphere parameters: radius, segments along width, segments along height
		var sphere = new THREE.Mesh( new THREE.SphereGeometry( radius, 32, 16 ), new THREE.MeshBasicMaterial( { color: colour } ) );

		sphere.position.set(position.x, position.y, position.z);
		return sphere;
	}

	scenograph.director.onWindowResize = function() {

		L.scenograph.director.camera.aspect = window.innerWidth / window.innerHeight;
		L.scenograph.director.camera.updateProjectionMatrix();

		L.scenograph.director.renderer.setSize( window.innerWidth, window.innerHeight );

	}
				
	scenograph.director.animate = function() {

		requestAnimationFrame( L.scenograph.director.animate );

		L.scenograph.director.controls.update();

		L.scenograph.director.renderer.render( L.scenograph.director.scene, L.scenograph.director.camera );

	}
	return scenograph;


};
},{}]},{},[3])