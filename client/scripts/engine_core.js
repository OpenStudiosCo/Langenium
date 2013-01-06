
/* ================================================================
-------------------------------------------------------  Engine Core -------------------------------------------------------
 
	

 ================================================================*/
 
 
 /*================================================================
	Variables
================================================================*/
 
 /* Camera variables
 --------------------------------------------------------------------------------------------------------------------------------*/
var $container = $('#container'), $canvas, winW, winH;
var camera, scene, renderer, stats;
var hblur, vblur;
var geometry, material, mesh;
var controls;
var player, ships = [], bots = [];
var keyboard = new THREEx.KeyboardState(), clock = new THREE.Clock();
var M = 10000 * 1000;
var composer;
 /*================================================================
	Main functions
================================================================*/

 /* Initialize the renderer scene
 --------------------------------------------------------------------------------------------------------------------------------*/
function init() {
	if (document.body && document.body.offsetWidth) {
		winW = document.body.offsetWidth;
		winH = document.body.offsetHeight;
	}
	if (document.compatMode=='CSS1Compat' &&
		document.documentElement &&
		document.documentElement.offsetWidth ) {
		winW = document.documentElement.offsetWidth;
		winH = document.documentElement.offsetHeight;
	}
	if (window.innerWidth && window.innerHeight) {
		winW = window.innerWidth;
		winH = window.innerHeight;
	}
	camera = new THREE.PerspectiveCamera( 45, (winW) / (winH), 10, M );
	camera.position.y = 6;
	camera.position.z = 40;

	createScene();
	controls = new THREE.TrackballControls(camera);
	controls.target.set(0, 0, 0);
	controls.staticMoving = true;

	stats = new Stats();
	stats.domElement.style.float = "left"
	$("#diagnostics").append(stats.domElement);
	
	renderer = new THREE.WebGLRenderer({
		antialias : true
	});
	renderer.setSize( winW, winH);
	$container.append(renderer.domElement);
	
}

 /* Create basic scene objects - sky, etc
 --------------------------------------------------------------------------------------------------------------------------------*/
function createScene() {

	scene = new THREE.Scene();
	
	var skyGeo = new THREE.CubeGeometry(M, M, M);
	var skyMat = new THREE.MeshLambertMaterial({
		shading: THREE.SmoothShading, 
		side: THREE.DoubleSide, 
		 vertexColors: THREE.VertexColors,
		overdraw: true 
	});
	

	for ( var i = 0; i < skyGeo.faces.length; i++ ) 
	{
		face = skyGeo.faces[ i ];

		face.vertexColors[0] =  new THREE.Color( 0x99ffff );
		face.vertexColors[1] =  new THREE.Color( 0x3399FF );
		face.vertexColors[2] =  new THREE.Color( 0x3399FF );
		face.vertexColors[3] =  new THREE.Color( 0x99ffff );
	}
	
	var sky = new THREE.Mesh(skyGeo, skyMat);
	sky.position.y += 10000;
	scene.add(sky);
	
	var geometry = new THREE.PlaneGeometry( M, M );	
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
	var material = new THREE.MeshLambertMaterial( {
		color: 0x003366,
		shading: THREE.SmoothShading, 
		side: THREE.DoubleSide, 
		overdraw: true
	} );

	var plane = new THREE.Mesh( geometry, material );

	scene.add( plane );
	
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, M, 0 );
	scene.add( hemiLight );
	
}	


 /* Player input
 --------------------------------------------------------------------------------------------------------------------------------*/
function playerInput(){
	var 	delta = clock.getDelta(),
			keyboardInput = { d: delta, pZ: 0, pY: 0, rY: 0 },
			move = false;
	
	if (keyboard.pressed("W")){
		move = true;
		keyboardInput.pZ = 1;
	}
	if (keyboard.pressed("S")){
		move = true;
		keyboardInput.pZ = -1;
	}
	// rotate left/right
	if (keyboard.pressed("A")) {
		move = true;
		keyboardInput.rY = 1;
	}
	if (keyboard.pressed("D")) {
		move = true;
		keyboardInput.rY = -1;
	}
	if (keyboard.pressed(" ")) {
		move = true;
		keyboardInput.pY = 1;
	}
	if (keyboard.pressed("shift")){
		move = true;
		keyboardInput.pY = -1;
	}
	return keyboardInput;
}

$(document).bind("mousedown", function(event) {
    switch (event.which) {
        case 1:
            //console.log("pew");
            break;
        case 2:
            //zoom IGNORE
            break;
        case 3:
            //rotate
            break;
    }
});

$(document).bind("mouseup", function(event){
    switch (event.which) {
        case 1:
            //shoot
            break;
        case 2:
            //zoom IGNORE
            break;
        case 3:
            if ((!resetXPosition)&&(!resetYPosition)&&(!resetZPosition)) {
				resetCamera();
			}
            break;
    }
});

var resetXPosition, resetYPosition, resetZPosition;
function resetCamera(){
	var duration = 1000;
	if (camera.position.x != 0) { 
		resetXPosition = new TWEEN.Tween( { x: camera.position.x , y: 0 } )
		.to( { x: 0 }, duration )
		.easing(TWEEN.Easing.Elastic.Out )
		.onUpdate( function () {
			camera.position.x = this.x;
		} )
		.onComplete(function() {
			resetXPosition = null;
		})
		.start();
	}
	if (camera.position.y != 0) { 
		resetYPosition = new TWEEN.Tween( { x: camera.position.y , y: 0 } )
		.to( { x: 6 }, duration )
		.easing(TWEEN.Easing.Elastic.Out )
		.onUpdate( function () {
			camera.position.y = this.x;
		} )
		.onComplete(function() {
			resetYPosition = null;
		})
		.start();
	}
	if (camera.position.z != 0) { 
		resetZPosition = new TWEEN.Tween( { x: camera.position.z , y: 0 } )
		.to( { x: 40 }, duration )
		.easing(TWEEN.Easing.Elastic.Out )
		.onUpdate( function () {
			camera.position.z = this.x;
		} )
		.onComplete(function() {
			resetZPosition = null;
		})
		.start();
	}

}
var resetPlayerZ = false;
var resetPlayerZCheck = setInterval(function(){
	if (player) {
		if (player.rotation.z != 0) {
				resetPlayerZ = true;
		}
	}
}, 500);

function animate() {
	TWEEN.update();
	var shipsMoving = false;
	if (player) {
		player.updateMatrix();
		var 	interval = new Date,
				intervalDelta = interval - player.moveInterval;
				
		player.rotation.x = Math.sin(interval/5000)/15;
		
		if (intervalDelta >= player.latency / 20) {
			playerInput();
			player.moveInterval = interval;
		}
		if (player.position.y < 50) {
			player.position.y += 3;
		}
		if (resetPlayerZ == true) {
			if (player.rotation.z != 0) {
				player.rotation.z -=  player.rotation.z / 50; 
			}
			else {
				resetPlayerZ = false;
			}
		}		
	}
	
	ships.forEach(function(ship,index){
		if (ship.position.y < 50) {
			ship.position.y += 3;
		}
		if (ship.rotation.z != 0) {
			ship.rotation.z -= ship.rotation.z / 50;
		}	
	});
	
	bots.forEach(function(bot,index){
		if (bot.position.y < 50) {
			bot.position.y += 3;
		}
		if (bot.rotation.z != 0) {
			bot.rotation.z -= bot.rotation.z / 50;
		}	
	});
	
	requestAnimationFrame( animate );
	
	renderer.render( scene, camera );
	controls.update();
	stats.update();
}

