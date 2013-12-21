/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Bullets
	This defines methods for bullet effects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var bullets = function() {
	this.collection = [];
	return this;
};

bullets.prototype.bulletEffect = function (position){
		var particleCount = 20,
				particles = new THREE.Geometry(),
				pMaterial =
				  new THREE.ParticleBasicMaterial({
					map: THREE.ImageUtils.loadTexture("assets/textures/particle.png?nocache"),
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
			engine.scene.add(particle_systems[particle_systems.length-1]);
}

bullets.prototype.handleBullets = function (delta){
	effects.bullets.collection.forEach(function(bullet, index){
		effects.bullets.collection[index].translateZ(-SPEED);
		effects.bullets.collection[index]._lifetime += delta;
		
		if (effects.bullets.collection[index]._lifetime > MAX_LIFETIME) {
			engine.scene.remove(effects.bullets.collection[index]);
			effects.bullets.collection.splice(index, 1);
		}
		else {
			objects.ships.collection.forEach(function(ship) {
				if ((bullet.socket_id != ship.socket_id)&&(ship.position.distanceTo(bullet.position) < 50)) {
					effects.particles.explosionEffect(bullet.position);
					engine.scene.remove(bullet);
				}
			});
		}
	});
}
 
bullets.prototype.addBullet = function (ship) {

	var geometry = new THREE.CubeGeometry(1, 1, 30);
	for ( var i = 0; i < geometry.faces.length; i ++ ) {
		
		geometry.faces[ i ].color.setHex( 0xFFFF00 );
	}
	
	var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, transparent: true, opacity: 0.8 } );
	var pVector = new THREE.Vector3(ship.position.x, ship.position.y, ship.position.z);
	
	var position = ship.position;
	var 	lBullet = effects.bullets.makeBullet(position, pVector, ship.rotation.y, 20, geometry, material),
			rBullet = effects.bullets.makeBullet(position, pVector, ship.rotation.y, -20, geometry, material);
			
	lBullet.socket_id = ship.socket_id;			
	rBullet.socket_id = ship.socket_id;
	
	effects.bullets.collection.push(lBullet);
	engine.scene.add(effects.bullets.collection[effects.bullets.collection.length-1]);
	effects.bullets.collection.push(rBullet);
	engine.scene.add(effects.bullets.collection[effects.bullets.collection.length-1]);

}



var	counter = 0,
		SPEED = 120, 
		INTERVAL = .05, 
		MAX_LIFETIME = 1;
		
bullets.prototype.makeBullet = function (position, pVector, rotation, shifter,geometry, material) {
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
