
function handleBullets(delta){
	counter += delta;
	if (counter >= INTERVAL) {
		counter -= INTERVAL;
		isFiring && addBullet(player);
	}
	if (player&&(player.children.length > 1)) {
		player.bullets.forEach(function(bullet, index){
			console.log(bullet);
			player.bullets[index].translateZ(-SPEED);
			player.bullets[index]._lifetime += delta;
			
			if (player.bullets[index]._lifetime > MAX_LIFETIME) {
				//toRemove.push(index);
				player.remove(bullet);
				player.bullets.splice(index, 1);
			}
		});
	}
	bots.forEach(function(bot, index){
		bots[index].bullets.forEach(function(bullet, bulletIndex){
			bots[index].bullets[bulletIndex].translateZ(-SPEED);
			bots[index].bullets[bulletIndex]._lifetime += delta;
			
			if (bots[index].bullets[bulletIndex]._lifetime > MAX_LIFETIME) {
				bots[index].remove(bullet);
				bots[index].bullets.splice(bulletIndex, 1);
			}
		});
	});
}

function addBullet(ship) {

	var geometry = new THREE.CubeGeometry(.5, .5, 30);
	
	for ( var i = 0; i < geometry.faces.length; i ++ ) {
		geometry.faces[ i ].color.setHex( 0xFF9900 );
	}
	
	var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
	var pVector = new THREE.Vector3(ship.position.x, ship.position.y, ship.position.z);
	
	var 	lBullet = makeBullet(ship.position, pVector, ship.rotation.y, 20, geometry, material),
			rBullet = makeBullet(ship.position, pVector, ship.rotation.y, -20, geometry, material);
				
	ship.bullets.push(lBullet);
	scene.add(ship.bullets[ship.bullets.length-1]);
	ship.bullets.push(rBullet);
	scene.add(ship.bullets[ship.bullets.length-1]);

}

var	counter = 0,
		vector = new THREE.Vector3(), 
		projector = new THREE.Projector(),
		SPEED = 8, 
		INTERVAL = .1, 
		MAX_LIFETIME = .5;
		
function makeBullet(position, pVector, rotation, shifter,geometry, material) {
	var bullet = new THREE.Mesh(geometry, material);
	bullet.opacity = .8;
	bullet.position.x = (position.x + shifter);
	bullet.position.y = position.y;
	bullet.position.z = position.z;
	bullet.rotation.y = rotation;
	
	var xRot = position.x + Math.sin(rotation) * shifter + Math.cos(rotation) * shifter;
	var zRot = position.z + Math.cos(rotation) * shifter - Math.sin(rotation) * shifter;
	
	bullet.position.x = xRot;
	bullet.position.z = zRot;
	
	vector.set(pVector);
	vector.scale = 10;
	// no need to reset the projector
	projector.unprojectVector(vector, camera);
	
	var target = vector;
	bullet.direction = target;
	$("#hits").html(target);
	bullet._lifetime = 0;

	return bullet;
}
