  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Players
	This class defines player objects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Exports Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

module.exports.make = make;


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Global Variables
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
		
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
function make(details) {
	/* 
		Adds a player to the world
		
		Properties:
			_id			Database ID
			username	player username
			class		'players'
			instance_id	Instance type (default: master)
			position	x:y:z:rY

		Functions:
			move

	*/

	details.move_ship = function (player, world, update, _complete) {
		/*
			if (details.client_position) {
				console.log("Client:")
				console.log(details.client_position);	
				console.log("Server:")
				console.log(player.position);	
			}
		*/

		player.d = update.details.d;
		update.details.socket_id = update.socket_id;
		update.details.username = player.username;
		update.details.type = 'move';
		update.details.obj_class = 'players';
		var 		velocityYChange = 66 * update.details.d,
					rotateAngle = (Math.PI / 7.5) * player.d;

		
		if (player.editor == true) {
			velocityYChange *= 20;
			if (update.details.pZ > 0 && player.velocity > -150) { player.velocity -= 2 }
			if (update.details.pZ < 0 && player.velocity < 75) { player.velocity += 2 }
		}
		else {
			if (update.details.pZ > 0 && player.velocity > -3.75) { player.velocity -= 1.75 }
			if (update.details.pZ < 0 && player.velocity < 2.5) { player.velocity += 1.75 }
		}
		

		if (update.details.rY > 0) { update.details.rY = rotateAngle; }						// left
		if (update.details.rY < 0) { update.details.rY = -rotateAngle; }						// right
		update.details.rY = (update.details.rY + update.details.rY * Math.PI / 180);
		
		if (update.details.pY > 0) { update.details.pY = velocityYChange; } 			// up
		if (update.details.pY < 0) { update.details.pY = -(velocityYChange); } 		// down

		update.details.rY += player.rotation.y;
		update.details.pY += player.position.y;
		
		var 	diffX = player.velocity * Math.sin(player.rotation.y),
				diffZ = player.velocity * Math.cos(player.rotation.y);

		player.position.x += diffX;
		player.position.y = update.details.pY;
		player.rotation.x = 0;
		player.rotation.y = parseFloat(update.details.rY);
		player.rotation.z = 0;
		player.position.z += diffZ;

		update.details.pX = player.position.x;
		update.details.pZ = player.position.z;

		
		_complete(update.details);
	};

	details.character_toggle = function(character_update, world, update, _complete) {
		_complete(update);
	}


	return details;
}
