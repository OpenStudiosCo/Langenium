
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
var player, ships = [], bots = [], bullets = [], particle_systems = [];
var projector = new THREE.Projector();
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
	camera.position.y = 5;
	camera.position.z = 50;

	createScene();
	controls = new THREE.TrackballControls(camera);
	controls.target.set(0, 0, 0);
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.5;

	stats = new Stats();
	stats.domElement.style.float = "left"
	$("#diagnostics").append(stats.domElement);
	
	renderer = new THREE.WebGLRenderer({
		antialias : true
	});
	renderer.setSize( winW, winH);
	$container.append(renderer.domElement);
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	window.addEventListener( 'resize', onWindowResize, false );
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
function playerInput(delta){
	var keyboardInput = { d: delta, pZ: 0, pY: 0, rY: 0, fire: isFiring },
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
	if (isFiring == true) {
		move = true;
	}
	
	if (move == true) {
		socket.emit('move', keyboardInput);
	}
	if (player.velocity != 0) {
		movePlayer(player.velocity / 66, player.position, keyboardInput);
	}
}

function movePlayer(velocity, playerPosition, data) {

	var 		velocityYChange = 300 * data.d,
				rotateAngle = 0.01744444444444444444444444444444 * 2;

	if (data.rY > 0) { data.rY = rotateAngle; }						// left
	if (data.rY < 0) { data.rY = -rotateAngle; }					// right
	data.rY = (data.rY + data.rY * Math.PI / 180);
	
	if (data.pY > 0) { data.pY = velocityYChange; } 			// up
	if (data.pY < 0) { data.pY = -(velocityYChange); } 		// down

	
	data.pX = velocity * Math.sin(player.rotation.y);
	data.pZ = velocity * Math.cos(player.rotation.y);
	
	var moveVector = new THREE.Vector3(data.pX, data.pY, data.pZ);
	var playerPositionVector = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
	
	var collisions = detectCollision(playerPositionVector, moveVector, world_map);

	if (collisions.length > 0) {
		collisions.forEach(function(collision, index){
			
			if (collision.distance < 90) {
		
				if (collision.point.x > playerPosition.x) 
					{ data.rY -= collision.distance / 10000; }
				if (collision.point.x < playerPosition.x) 
					{ data.rY += collision.distance / 10000; }
				
				if (data.pX != 0) {
					data.pX *= -.001;
				}
				if (data.pY != 0) {
					data.pY *= -.001;
				}
				if (data.pZ != 0) {
					data.pZ *= -.001;
				}
			}
		}); 
	}
	
		moveShip(player, true, { name: "move", type: "player", details: data });
}

var isFiring = false;
$(document).bind("mousedown", function(event) {
    switch (event.which) {
        case 1:
            isFiring = true;
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
            isFiring = false;
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
	if ((player)&&(player.rotation.z != 0)) {
		resetPlayerZ = true;
	}
}, 500);

// model animations
var duration = 100,
	keyframes = 5,
	animOffset = 0,
	interpolation = duration / keyframes,
	lastKeyframe = 0, currentKeyframe = 0;
	
function animate() {
	var delta = clock.getDelta();
	
	handleParticles(delta);
	handleBullets(delta);
	var animTime = new Date().getTime() % duration;
	var keyframe = Math.floor( animTime / interpolation ) + animOffset;
	
	TWEEN.update();
	var shipsMoving = false;
	if (player) {
		if  (player.velocity != 0) {
			player.velocity *= .996;
		}
		if ( keyframe != currentKeyframe ) {
			player.morphTargetInfluences[ lastKeyframe ] = 0;
			player.morphTargetInfluences[ currentKeyframe ] = 1;
			player.morphTargetInfluences[ keyframe ] = 0;

			lastKeyframe = currentKeyframe;
			currentKeyframe = keyframe;
		}

		player.morphTargetInfluences[ keyframe ] = ( animTime % interpolation ) / interpolation;
		player.morphTargetInfluences[ lastKeyframe ] = 1 - player.morphTargetInfluences[ keyframe ];
		player.updateMatrix();
		var 	interval = new Date,
				intervalDelta = interval - player.moveInterval;
				

		
		if (intervalDelta >= player.latency / 20) {
			playerInput(delta);
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
		if (player) {
			bots[index].children[0].rotation.x = -bots[index].rotation.x;
			bots[index].children[0].rotation.y = -bots[index].rotation.y + player.rotation.y + player.children[0].rotation.y;
			bots[index].children[0].rotation.z = -bots[index].rotation.z;
		}
		if (bot.position.y < 50) { bot.position.y += 3; }
		if (bot.rotation.z != 0) { bot.rotation.z -= bot.rotation.z / 50; }
	});
	
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	controls.update();
	stats.update();
}

var mouse = new THREE.Vector2(),
			offset = new THREE.Vector3(),
			INTERSECTED, SELECTED;

function onDocumentMouseDown( event ) {

				event.preventDefault();

				var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
				projector.unprojectVector( vector, camera );

				var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

				var intersects = raycaster.intersectObjects( bots );

				if ( intersects.length > 0 ) {
					console.log("HELLO");
					controls.enabled = false;

					SELECTED = intersects[ 0 ].object;

					var intersects = raycaster.intersectObject( plane );
					offset.copy( intersects[ 0 ].point ).sub( plane.position );

					container.style.cursor = 'move';

				}

			}

function onDocumentMouseUp( event ) {

	event.preventDefault();

	controls.enabled = true;

	if ( INTERSECTED ) {

		plane.position.copy( INTERSECTED.position );

		SELECTED = null;

	}

	container.style.cursor = 'auto';

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}
