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
	this.mercenary = {
		mesh_url: '/game/assets/objects/ships/mercenary.js',
		health: 1000,
		faction: 'Winthrom'
	};
    return this;
}

ships.prototype.make = function (instruction, mesh, is_player, ship_type) {
	mesh.ship_attributes = {
		health: ship_type.health,
		faction: ship_type.faction,
		lastKeyframe: 0, 
		currentKeyframe: 0
	};
	
	if (is_player == true) {
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
	else {
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
		ship.morphTargetInfluences[ ship.ship_attributes.lastKeyframe ] = 1 - player.morphTargetInfluences[ keyframe ];
		ship.updateMatrix();
	}
}