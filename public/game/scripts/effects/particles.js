/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Objects
	This defines object methods and proxies the sub class functions 
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var particles = function() {
	this.systems = [];
	this.thrusters = [];
	this.plasma = [];
	return this;
};

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Special Effects
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

particles.prototype.explosionEffect = function (position){
		var particleCount = 10,
				particles = new THREE.Geometry(),
				pMaterial =
				  new THREE.ParticleBasicMaterial({
					map: THREE.ImageUtils.loadTexture("/game/assets/textures/particles/particle.png?nocache"),
					size: .125,
					blending: THREE.AdditiveBlending,
					transparent: true
				  });

			// now create the individual particles
			for(var p = 0; p < particleCount; p++) {
				// create a particle with random
				// position values, -250 -> 250
				var pX = position.x + Math.random() * 1.1 - .5,
					pY = position.y + Math.random() * 1.1 - .5,
					pZ = position.z + Math.random() * 1.1 - .5,
					particle = new THREE.Vector3(pX, pY, pZ);
				// add it to the geometry
				particles.vertices.push(particle);
			}

			// create the particle system
			var particle_system = new THREE.ParticleSystem(particles, pMaterial);	
			particle_system.max = 2;
			particle_system.min = -1;
			particle_system._lifetime = 0;
			particle_system.sortParticles = true;
			effects.particles.systems.push(particle_system);
			// add it to the scene
			scene.add(effects.particles.systems[effects.particles.systems.length-1]);
}

particles.prototype.teleportEffect = function (position){
		var particleCount = 1000,
				particles = new THREE.Geometry(),
				pMaterial =
				  new THREE.ParticleBasicMaterial({
					map: THREE.ImageUtils.loadTexture("/game/assets/textures/particles/particle.png?nocache"),
					size: .5,
					blending: THREE.AdditiveBlending,
					transparent: true
				  });

			// now create the individual particles
			for(var p = 0; p < particleCount; p++) {
				// create a particle with random
				// position values, -250 -> 250
				var pX = position.x + Math.random() * 2 - 1.25,
				  pY = position.y + Math.random() * 2 - 1.25,
				  pZ = position.z + Math.random() * 2 - 1.25,
				  particle = new THREE.Vector3(pX, pY, pZ);
				// add it to the geometry
				particles.vertices.push(particle);
			}

			// create the particle system
			var particle_system = new THREE.ParticleSystem(particles, pMaterial);	
			particle_system.max = 16;
			particle_system.min = 8;
			particle_system._lifetime = -2;
			particle_system.sortParticles = true;
			effects.particles.systems.push(particle_system);
			// add it to the scene
			scene.add(effects.particles.systems[effects.particles.systems.length-1]);
}

particles.prototype.cloudEffect = function (position){
		var 	particle,
				particleCount = 2000,
				particles = new THREE.Geometry(),
				pMaterial =
				  new THREE.ParticleBasicMaterial({
				  transparent: true,
					map: THREE.ImageUtils.loadTexture("/game/assets/textures/particles/cloud10.png?nocache"),
					size: 512, alphaTest: 0.5
					
						
				  });

			// now create the individual particles
			
			for(var p = 0; p < particleCount; p++) {
				// create a particle with random
				// position values, -250 -> 250
				  var noise = new SimplexNoise();
				
				var pX = position.x, pY = position.y, pZ = position.z;
				var n = noise.noise4d(pX, pY, pZ, p);
				
				for (var j = 0; j < 100; j++) {
					pX +=   Math.random() * 2500;
					pY +=   Math.random() * n * -133;
					pZ +=   Math.random() * 2500;
					for (var k = 0; k < 100; k++) {
						pX += Math.random() / n;
						pY -= Math.random() * n;
						pZ += Math.random() * n;
					}
				
				}
				  particle = new THREE.Vector3(pX, pY, pZ);
				// add it to the geometry
				particles.vertices.push(particle);
			}

			// create the particle system
			var particle_system = new THREE.ParticleSystem(particles, pMaterial);	
			particle_system.name = "clouds";
			particle_system.max = 16;
			particle_system.min = 8;
			particle_system._lifetime = -2;
			particle_system.sortParticles = true;
			particle_system.rotation.y = Math.random();
			// add it to the scene
			scene.add(particle_system);
}

particles.prototype.handleParticles = function (delta){
	effects.particles.systems.forEach(function(particle_system,index){
		particle_system._lifetime += delta;
		particle_system.sortParticles = true;
		particle_system.material.color.r -= Math.random()*.001;
		particle_system.material.color.g += Math.random()*.001;
		if (particle_system.material.opacity > 0){
		particle_system.material.opacity *= .99;
		}
		particle_system.geometry.vertices.forEach(function(particle,index){
			particle.x += Math.random() * particle_system.max - particle_system.min;
			particle.y += Math.random() * particle_system.max - particle_system.min;
			particle.z += Math.random() * particle_system.max - particle_system.min;
		});
		particle_system.geometry.__dirtyVertices = true;
		if (particle_system._lifetime > 1.57) {
			scene.remove(particle_system);
			effects.particles.systems.splice(index,1);
		}
	});
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Object Effects
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

particles.prototype.createThruster = function (scale, position){
	var plasmaTexture = new THREE.ImageUtils.loadTexture('/game/assets/textures/particles/plasma.png?nocache');
	
	// use "this." to create global object
	var uniforms = 
	{
		baseTexture: { type: "t", value: plasmaTexture },
		mixAmount: 	 { type: "f", value: 0.0 }
	};
	var particleCount = 15,
		particles = new THREE.Geometry(),

		pMaterial = new THREE.ParticleBasicMaterial({
			map: THREE.ImageUtils.loadTexture("/game/assets/textures/particles/plasma.png?nocache"),
			size: 7.5 * scale,
			blending: THREE.AdditiveBlending,
			opacity: 0.9,
			transparent: true,
			alphaTest: 0.3
		  });

	// now create the individual particles
	var	pos_x_max = 29.5 * scale,
		pos_x_min = 5.5 * scale,
		pos_y_max = 50 * scale,
		pos_y_min = 25 * scale;

	for(var p = 0; p < particleCount; p++) {
		// create a particle with random
		// position values, -250 -> 250
		var pX = Math.random() * pos_x_max - pos_x_min,
			pY = Math.random() * pos_y_max - pos_y_min,
			pZ = Math.random() * pos_x_max - pos_x_min,
			particle = new THREE.Vector3(pX, pY, pZ);
		// add it to the geometry
		particles.vertices.push(particle);
	}

	// create the particle system
	var thruster = new THREE.ParticleSystem(particles, pMaterial);	
	thruster.sortParticles = true;
	thruster.max_y = position.y;
	thruster.min_y = position.y - 35 * scale;
	thruster.position.x = position.x;
	thruster.position.y = position.y;
	thruster.position.z = position.z;
	thruster.obj_scale = scale;
	effects.particles.thrusters.push(thruster);
	// add it to the scene
	return thruster;
}

particles.prototype.animateThrusters = function (delta) {
	effects.particles.thrusters.forEach(function(thruster, index){
		thruster.sortParticles = true;
		thruster.geometry.vertices.forEach(function(particle,i){
			if (particle.y > thruster.min_y && particle.y < thruster.max_y) {
				particle.y -= i + Math.sin(i * delta) * 6.321 * thruster.obj_scale;
			}
			else {
				particle.y = thruster.max_y - 5 * thruster.obj_scale;
			}
		});
		thruster.geometry.__dirtyVertices = true;
	
	});
};

particles.prototype.createShipThruster = function (mesh, scale, position) {
	var particleCount = 10,
		particles = new THREE.Geometry(),
		pMaterial =
		  new THREE.ParticleBasicMaterial({
			map: THREE.ImageUtils.loadTexture("/game/assets/textures/particles/ember.png?nocache"),
			size: .65 * scale,
			blending: THREE.AdditiveBlending,
			opacity: 0.9,
			transparent: true,
			alphaTest: 0.3
		  });

	// now create the individual particles
	var	pos_x_max = .009 * scale,
		pos_x_min = .007 * scale,
		pos_y_max = .005 * scale,
		pos_y_min = .005 * scale;

	for(var p = 0; p < particleCount; p++) {
		// create a particle with random
		// position values, -250 -> 250
		var pX = Math.random() * pos_x_max - pos_x_min,
			pY = Math.random() * pos_y_max - pos_y_min,
			pZ = Math.random() * pos_x_max - pos_x_min,
			particle = new THREE.Vector3(pX, pY, pZ);
		// add it to the geometry
		if (p == 0) {
			pX = 0;
			pY = 0;
			pZ = 0;
		}
		particles.vertices.push(particle);
	}

	// create the particle system
	var plasma = new THREE.ParticleSystem(particles, pMaterial);	
	plasma.sortParticles = true;
	plasma.max_z = position.z;
	plasma.min_z = position.z - .025;
	plasma.position.x = position.x;
	plasma.position.y = position.y;
	plasma.position.z = position.z;
	plasma.scale.set(10,10,10);
	plasma.obj_scale = scale;
	effects.particles.plasma.push(plasma);
	// add it to the scene
	mesh.add(plasma);
};

particles.prototype.animateShipThrusters = function (delta) {
	effects.particles.plasma.forEach(function(plasma, index){
		plasma.sortParticles = true;
		var velocity = -plasma.parent.velocity;
		plasma.geometry.vertices.forEach(function(particle,i){
			if (i != 0) {
				if (particle.z > plasma.min_z * velocity && particle.z < plasma.max_z * velocity) {
					particle.z -= Math.sin(i * delta) * .06321 * velocity;
				}
				else {
					particle.z = plasma.max_z - .005 * velocity;
				}
			}
		});
		plasma.geometry.__dirtyVertices = true;
	
	});
};


