/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	LANGENIUM CLIENT 
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var client = function() {

	this.camera;
	this.isFiring = false;
	this.username = "Saggy Nuts";
	this.winW = 1024;
	this.winH = 768;

	return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

client.prototype.initialize = function () {
/*
	Initializes the client... :P
*/
	engine.renderer = new THREE.WebGLRenderer({
		antialias : true
	});

	//default to flight camera
	client.camera = controls.flight.camera;
	
	engine.createScene();
	
	engine.renderer.setSize( client.winW, client.winH);
	$("#game").append(engine.renderer.domElement);
	
	window.addEventListener( 'resize', client.onWindowResize, false );
}

client.prototype.onWindowResize = function () {
/*
	Resizes the engine.renderer
*/
	client.updateWinSizeVariables();
	client.camera.aspect = client.winW / client.winH;
	client.camera.updateProjectionMatrix();
 
	engine.renderer.setSize( client.winW, client.winH );
}

client.prototype.updateWinSizeVariables = function (){
/*
	Update the global window variables
*/
	if (document.body && document.body.offsetWidth) {
		client.winW = document.body.offsetWidth;
		client.winH = document.body.offsetHeight;
	}
	if (document.compatMode=='CSS1Compat' &&
		document.documentElement &&
		document.documentElement.offsetWidth ) {
		client.winW = document.documentElement.offsetWidth;
		client.winH = document.documentElement.offsetHeight;
	} 
	if (window.innerWidth && window.innerHeight) {
		client.winW = window.innerWidth;
		client.winH = window.innerHeight;
	}
}

