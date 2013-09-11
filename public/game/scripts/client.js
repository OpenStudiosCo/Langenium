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

	if (window.location.href.indexOf("editor") > 0) { this.is_editor = true; } else { this.is_editor = false; }

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
	
	engine.renderer.setSize( client.winW, client.winH);

	events.socket.emit("login", { username: "Droopy", editor: client.is_editor });
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

