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
	details.move = function (player, world, socket_id, details, _complete) {
		/*
			if (details.client_position) {
				console.log("Client:")
				console.log(details.client_position);	
				console.log("Server:")
				console.log(player.position);	
			}
		*/

		player.d = details.d;
		details.socket_id = socket_id;
		details.username = player.username;
		details.type = 'move';
		details.obj_class = 'players';
		var 		velocityYChange = 120 * details.d,
					rotateAngle = 0.01744444444444444444444444444444 * 50 * details.d;

		
		if (player.editor == true) {
			velocityYChange *= 20;
			if (details.pZ > 0 && player.velocity > -150) { player.velocity -= 15 }
			if (details.pZ < 0 && player.velocity < 75) { player.velocity += 15 }
		}
		else {
			if (details.pZ > 0 && player.velocity > -3.75) { player.velocity -= 1.75 }
			if (details.pZ < 0 && player.velocity < 2.5) { player.velocity += 1.75 }
		}
		

		if (details.rY > 0) { details.rY = rotateAngle; }						// left
		if (details.rY < 0) { details.rY = -rotateAngle; }						// right
		details.rY = (details.rY + details.rY * Math.PI / 180);
		
		if (details.pY > 0) { details.pY = velocityYChange; } 			// up
		if (details.pY < 0) { details.pY = -(velocityYChange); } 		// down

		details.rY += player.rotation.y;
		details.pY += player.position.y;
		
		var 	diffX = player.velocity * Math.sin(player.rotation.y),
				diffZ = player.velocity * Math.cos(player.rotation.y);

		player.position.x += diffX;
		player.position.y = details.pY;
		player.rotation.x = 0;
		player.rotation.y = parseFloat(details.rY);
		player.rotation.z = 0;
		player.position.z += diffZ;

		details.pX = player.position.x;
		details.pZ = player.position.z;

		
		_complete(details);
	};



	return details;
}
