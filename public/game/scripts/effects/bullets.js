function bulletEffect(position){
		var particleCount = 20,
				particles = new THREE.Geometry(),
				pMaterial =
				  new THREE.ParticleBasicMaterial({
					map: THREE.ImageUtils.loadTexture("assets/particle.png?nocache"),
					size: .25,
					blending: THREE.AdditiveBlending,
					transparent: true
				  });

			// now create the individual particles
			for(var p = 0; p < particleCount; p++) {
				// create a particle with random
				// position values, -250 -> 250
				var pX = position.x + Math.random() * 4 - 2,
				  pY = position.y + Math.random() * 4 - 2,
				  pZ = position.z + Math.random() * 4 - 2,
				  particle = new THREE.Vector3(pX, pY, pZ);
				// add it to the geometry
				particles.vertices.push(particle);
			}

			// create the particle system
			var particle_system = new THREE.ParticleSystem(particles, pMaterial);	
			particle_system.max = 6;
			particle_system.min = 1;
			particle_system._lifetime = 0;
			particle_system.sortParticles = true;
			particle_systems.push(particle_system);
			// add it to the scene
			scene.add(particle_systems[particle_systems.length-1]);
}

function handleBullets(delta){
	bullets.forEach(function(bullet, index){
		bullets[index].translateZ(-SPEED);
		bullets[index]._lifetime += delta;
		
		if (bullets[index]._lifetime > MAX_LIFETIME) {
			scene.remove(bullets[index]);
			bullets.splice(index, 1);
		}
		else {
			bots.forEach(function(bot) {
				if ((bullet.username != bot.id)&&(bot.position.distanceTo(bullet.position) < 50)) {
					scene.remove(bullet);
				}
			});
		}
	});
}
 
function addBullet(ship) {

	var geometry = new THREE.CubeGeometry(1, 1, 30);
	for ( var i = 0; i < geometry.faces.length; i ++ ) {
		
		geometry.faces[ i ].color.setHex( 0xFF6600 );
	}
	
	var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
	var pVector = new THREE.Vector3(ship.position.x, ship.position.y, ship.position.z);
	
	var 	lBullet = makeBullet(ship.position, pVector, ship.rotation.y, 20, geometry, material),
			rBullet = makeBullet(ship.position, pVector, ship.rotation.y, -20, geometry, material);
			
	lBullet.username = ship.username || ship.id;			
	rBullet.username = ship.username || ship.id;
	
	bullets.push(lBullet);
	scene.add(bullets[bullets.length-1]);
	bullets.push(rBullet);
	scene.add(bullets[bullets.length-1]);

}



var	counter = 0,
		SPEED = 30, 
		INTERVAL = .1, 
		MAX_LIFETIME = 1;
		
function makeBullet(position, pVector, rotation, shifter,geometry, material) {
	var bullet = new THREE.Mesh(geometry, material);
	
	bullet.opacity = .8;
	bullet.position.x = position.x;
	bullet.position.y = position.y + 10;
	bullet.position.z = position.z;
	bullet.rotation.z = Math.PI / 4;
	bullet.rotation.y = rotation;

	var xRot = position.x + Math.sin(rotation) * shifter + Math.cos(rotation) * shifter;
	var zRot = position.z + Math.cos(rotation) * shifter - Math.sin(rotation) * shifter;
	
	bullet.position.x = xRot;
	bullet.position.z = zRot;
	
	bullet._lifetime = 0;
	bullet.updateMatrix();
	return bullet;
}
