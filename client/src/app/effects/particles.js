// Sets up the particle effects

import * as THREE from 'three';

export default function setupParticles( ) {
    return {
        shipThrusters: [],
        createShipThruster: createShipThruster,
        animateShipThrusters: animateShipThrusters
    };
}


function createShipThruster (ship, scale, position) {
    const assignSRGB = ( texture ) => {
        texture.colorSpace = THREE.SRGBColorSpace;
    };
	const particleCount = 10;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const pMaterial =
		  new THREE.PointsMaterial({
			map: window.l.current_scene.loaders.texture.load("/assets/textures/ember.png?nocache", assignSRGB),
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
			pZ = Math.random() * pos_x_max - pos_x_min;
		// add it to the geometry
		if (p == 0) {
			pX = 0;
			pY = 0;
			pZ = 0;
		}
		vertices.push(pX, pY, pZ);
	}

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'initialPosition', new THREE.Float32BufferAttribute( vertices, 3 ) );

	// create the particle system
	var plasma = new THREE.Points(geometry, pMaterial);	
	plasma.sortParticles = true;
	plasma.max_z = 0;
	plasma.min_z = .025;
	plasma.position.x = position.x;
	plasma.position.y = position.y;
	plasma.position.z = position.z;
	plasma.scale.set(10,10,10);
	plasma.obj_scale = scale;
    plasma.ship = ship;
    plasma.vertices = vertices;
	window.l.current_scene.effects.particles.shipThrusters.push(plasma);
	// add it to the scene
	ship.mesh.add(plasma);
};

function animateShipThrusters (delta) {
	window.l.current_scene.effects.particles.shipThrusters.forEach(function(plasma, index){
		const velocity = plasma.ship.state.airSpeed;
		plasma.sortParticles = true;

        const positions = plasma.geometry.getAttribute('position');
        const initialPositions = plasma.geometry.getAttribute('initialPosition');
        const count = positions.count;

        for ( let i = 0; i < count; i ++ ) {
			if (i != 0) {
				const pz = positions.getZ( i );
				const iz = initialPositions.getZ( i );
				
				let dz = Math.abs( pz - iz );
				if (dz > plasma.min_z * velocity && dz < plasma.max_z * velocity) {
					dz -= Math.sin(i * delta) * .6321 * velocity;
				}
				else {
					dz = plasma.max_z - .05 * velocity;
				}

				let sputter = Math.min(- velocity / 100, 0.01);

				positions.array[i * 3 ] = Math.sin(i) * 0.01 + Math.random() * (sputter * -2) + sputter;
				positions.array[i * 3 + 1] = Math.cos(i) * 0.01 + Math.random() * (sputter * -2) + sputter;
				positions.array[i * 3 + 2] = dz;
				
			}

        }

		plasma.geometry.setAttribute('position', positions);
		positions.needsUpdate = true
	
	});
};
