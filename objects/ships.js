/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Ships
	This class defines the ships object type
	
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
		Adds a ship to the world
		
		Parameters:
			username - ship username
	*/

	details.move_ship = function (ship, world, update, _complete) {
		/*
			if (details.client_position) {
				console.log("Client:")
				console.log(details.client_position);	
				console.log("Server:")
				console.log(ship.position);	
			}
		*/
		
		ship.d = update.details.d;
		update.details.socket_id = update.socket_id;
		update.details.username = ship.username;
		var 		velocityYChange = 22 * update.details.d,
					rotateAngle = 0.78539816339 * update.details.d;

		if (ship.editor == true) {
			velocityYChange *= 20;
			if (update.details.pZ > 0 && ship.velocity > -150) { ship.velocity -= 2 }
			if (update.details.pZ < 0 && ship.velocity < 75) { ship.velocity += 2 }
		}
		else {
			if (update.details.pZ > 0 && ship.velocity > -3.75) { ship.velocity -= 1.75 }
			if (update.details.pZ < 0 && ship.velocity < 2.5) { ship.velocity += 1.75 }
		}
		

		if (update.details.rY > 0) { update.details.rY = rotateAngle; }						// left
		if (update.details.rY < 0) { update.details.rY = -rotateAngle; }						// right
		update.details.rY = (update.details.rY + update.details.rY * Math.PI / 180);
		
		if (update.details.pY > 0) { update.details.pY = velocityYChange; } 			// up
		if (update.details.pY < 0) { update.details.pY = -(velocityYChange); } 		// down

		update.details.rY += parseFloat(ship.rotation.y);
		update.details.pY += parseFloat(ship.position.y);
		
		var 	diffX = ship.velocity * Math.sin(ship.rotation.y),
				diffZ = ship.velocity * Math.cos(ship.rotation.y);

		ship.position.x += parseFloat(diffX);
		ship.position.y = parseFloat(update.details.pY);
		ship.position.z += parseFloat(diffZ);
		ship.rotation.x = parseFloat(0);
		ship.rotation.y = parseFloat(update.details.rY);
		ship.rotation.z = parseFloat(0);
		

		update.details.pX = parseFloat(ship.position.x);
		update.details.pZ = parseFloat(ship.position.z);

		_complete(update);
	};

	return details;
}