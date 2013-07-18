  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Ships
	This class defines ship objects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var ships = function() {
	this.animation_queue = [];
	this.collection = [];

    return this;
}

ships.prototype.make = function (obj_class, instruction, mesh) {
	mesh.ship_attributes = {
		health: instruction.health,
		faction: instruction.faction,
		lastKeyframe: 0, 
		currentKeyframe: 0
	};

	mesh.exit_ship = function() {
		
	};

	mesh.move = function(ship, isPlayer, instruction){
		if (instruction.velocity) {
			ship.velocity = instruction.velocity;
		}
		if (instruction.details.fire == true) {
			effects.bullets.addBullet(ship);
		}
		if (instruction.details.pY != 0){
			ship.position.y = instruction.details.pY;
		}
		
		if (instruction.details.pX != 0){
			ship.position.x = instruction.details.pX;
		}
		
		if (instruction.details.pZ != 0) {
			ship.position.z = instruction.details.pZ;
		}
		
		var rotate = parseFloat(instruction.details.rY - ship.rotation.y);
		var rotate_factor = parseFloat(rotate / 5);

		if (rotate > 0){
			if (ship.rotation.z < .5) {
				ship.rotation.z += rotate_factor;
				if (isPlayer == true && controls.flight.camera.rotation.y < .25) { 
					controls.flight.camera.rotation.y += rotate_factor;	
					controls.flight.camera.rotation.z -= rotate_factor; 
				}
			}
			else {
				rotate_factor = rotate / 6;
				ship.rotation.z += rotate_factor;
				if (isPlayer == true && controls.flight.camera.rotation.y < .35) { 
					controls.flight.camera.rotation.y += rotate_factor;	
					controls.flight.camera.rotation.z -= rotate_factor; 
				}
			}
			ship.rotation.y = instruction.details.rY;
		}
		if (rotate < 0) {
			if (ship.rotation.z > -.5) {
				ship.rotation.z += rotate_factor;
				if (isPlayer == true && controls.flight.camera.rotation.y > -.25) { 
					controls.flight.camera.rotation.y += rotate_factor; 
					controls.flight.camera.rotation.z -= rotate_factor; 
				}
			}
			else {
				rotate_factor = rotate / 6;
				ship.rotation.z += rotate_factor;
				if (isPlayer == true && controls.flight.camera.rotation.y > -.35) { 
					controls.flight.camera.rotation.y += rotate_factor; 
					controls.flight.camera.rotation.z -= rotate_factor; 
				}
			}
			ship.rotation.y = instruction.details.rY;
		}
		if (isPlayer == true) {
			objects.characters.collection.forEach(function(character){
				if (character.socket_id != player.socket_id) {
					character.rotation.y = instruction.details.rY;
				}
			});
		}
	};
	
	effects.particles.createShipThruster(mesh, 2.5, { x: 0, y: 0, z: 0 });
	mesh.children[0].position.x = -.095;
	mesh.children[0].position.y = 1.025;
	mesh.children[0].position.z = 1.75;
	mesh.children[0].rotation.y = 3.14;

	if (!player && instruction.socket_id && instruction.socket_id == events.socket.socket.sessionid) {
		controls.enabled = true;
		player = mesh;
		player.bullets = [];
		player.moveInterval = new Date().getTime();
		player.username = instruction.username;
		player.socket_id = instruction.socket_id;
		player.material.materials.forEach(function(material,index){
			player.material.materials[index].morphTargets = true;
		});

		player.velocity = 0;
		
		player.add(client.camera);
		
		scene.add(player);
		objects.ships.collection.push(player);
		objects.ships.animation_queue.push(player);
	}
	if (instruction.socket_id && instruction.socket_id != events.socket.socket.sessionid) {
		var ship = mesh;
		ship.bullets = [];
		ship.moveInterval = new Date().getTime();
		ship.username = instruction.username;
		ship.socket_id = instruction.socket_id;
		ship.material.materials.forEach(function(material,index){
			ship.material.materials[index].morphTargets = true;
		});
		
		ship.velocity = 0;
		
		objects.ships.collection.push(ship);
		scene.add(objects.ships.collection[objects.ships.collection.length-1]);
		objects.ships.animation_queue.push(objects.ships.collection[objects.ships.collection.length-1]);
	}
	
}


ships.prototype.animate = function (animTime, keyframe, ship, delta) {
	
	if (ship.rotation.z != 0) { ship.rotation.z *= .96; }
	if (ship.morphTargetInfluences && ship.morphTargetInfluences.length > 0) {

		if ( keyframe != ship.ship_attributes.currentKeyframe ) {
			ship.morphTargetInfluences[ ship.ship_attributes.lastKeyframe ] = 0;
			ship.morphTargetInfluences[ ship.ship_attributes.currentKeyframe ] = 1;
			ship.morphTargetInfluences[ keyframe ] = 0;
			
			ship.ship_attributes.lastKeyframe = ship.ship_attributes.currentKeyframe;
			ship.ship_attributes.currentKeyframe = keyframe;
		}

		ship.morphTargetInfluences[ keyframe ] = ( animTime % engine.interpolation ) / engine.interpolation;
		ship.morphTargetInfluences[ ship.ship_attributes.lastKeyframe ] = 1 - ship.morphTargetInfluences[ keyframe ];
		ship.updateMatrix();
	}
}