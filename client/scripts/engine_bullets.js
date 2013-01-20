
function handleBullets(delta){
	counter += delta;
	if (counter >= INTERVAL) {
		counter -= INTERVAL;
		isFiring && addBullet(player);
	}
	if (bullets.length > 1) {
		bullets.forEach(function(bullet, index){
			bullets[index].translateZ(-SPEED);
			bullets[index]._lifetime += delta;
			
			if (bullets[index]._lifetime > MAX_LIFETIME) {
				scene.remove(bullet);
				bullets.splice(index, 1);
			}
		});
	}
}
 
function addBullet(ship) {

	var geometry = new THREE.CubeGeometry(1, 1, 30);
	
	for ( var i = 0; i < geometry.faces.length; i ++ ) {
		geometry.faces[ i ].color.setHex( 0xEE1133 );
	}
	
	var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
	var pVector = new THREE.Vector3(ship.position.x, ship.position.y, ship.position.z);
	
	var 	lBullet = makeBullet(ship.position, pVector, ship.rotation.y, 20, geometry, material),
			rBullet = makeBullet(ship.position, pVector, ship.rotation.y, -20, geometry, material);
				
	bullets.push(lBullet);
	scene.add(bullets[bullets.length-1]);
	bullets.push(rBullet);
	scene.add(bullets[bullets.length-1]);

}

var	counter = 0,
		vector = new THREE.Vector3(), 
		projector = new THREE.Projector(),
		SPEED = 30, 
		INTERVAL = .1, 
		MAX_LIFETIME = 1;
		
function makeBullet(position, pVector, rotation, shifter,geometry, material) {
	var bullet = new THREE.Mesh(geometry, material);
	
	bullet.opacity = .8;
	bullet.position.x = position.x + shifter;
	bullet.position.y = position.y + 10;
	bullet.position.z = position.z + shifter;
	bullet.rotation.y = rotation;

	rotation *= 180 / Math.PI;
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
	bullet.updateMatrix();
	return bullet;
}
