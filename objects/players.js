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
			url			ship mesh
			scale		ship scale

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

		if (details.pZ > 0 && player.velocity > -7.5) { player.velocity -= 7.5 }
		if (details.pZ < 0 && player.velocity < 5) { player.velocity += 7.5 }

		if (details.rY > 0) { details.rY = rotateAngle; }						// left
		if (details.rY < 0) { details.rY = -rotateAngle; }						// right
		details.rY = (details.rY + details.rY * Math.PI / 180);
		
		if (details.pY > 0) { details.pY = velocityYChange; } 			// up
		if (details.pY < 0) { details.pY = -(velocityYChange); } 		// down

		details.rY += player.position.rY;
		details.pY += player.position.y;
		
		var 	diffX = player.velocity * Math.sin(player.position.rY),
				diffZ = player.velocity * Math.cos(player.position.rY);

		player.position.x += diffX;
		player.position.y = details.pY;
		player.position.rY = details.rY;
		player.position.z += diffZ;

		details.pX = player.position.x;
		details.pZ = player.position.z;

		
		_complete(details);
	};



	return details;
}
