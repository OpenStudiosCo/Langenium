/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Ships
	This is the model that defines the models for the game's ship objects


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Standard pattern to allow this file to be chained up in the modules container

module.exports= function(modules) {
	var ships = {};

	ships.move_ship = function(delta, update, _complete) {
		var 		velocityYChange = 33.3333,
					rotateAngle = 0.01744444444444444444444444444444 * 2;	
		
		update.details.socket_id = update.socket_id;
		update.details.username = update.object.username;

		// forward
		if (update.details.pZ > 0 && update.object.velocity > -37.5) {
			update.object.velocity -= 3.175 
		}		

		// back
		if (update.details.pZ < 0 && update.object.velocity < 23.5) {
			update.object.velocity += 3.175 
		}		
		// left
		if (update.details.rY > 0) {
			update.details.rY = rotateAngle; 
		}
		// right
		if (update.details.rY < 0) { update.details.rY = -rotateAngle; }									
		update.details.rY = (update.details.rY + update.details.rY * Math.PI / 180);
		
		// up
		if (update.details.pY > 0) { 
			update.details.pY = velocityYChange; 
		}
		// down
		if (update.details.pY < 0) { 
			update.details.pY = -(velocityYChange); 
		}

		
		update.details.rY += parseFloat(update.object.rotation.y);	
		
		update.details.pY += parseFloat(update.object.position.y);	
	
		

		update.object.position.x += parseFloat(update.object.velocity * Math.sin(update.object.rotation.y));
		update.object.position.y = parseFloat(update.details.pY);
		update.object.position.z += parseFloat(update.object.velocity * Math.cos(update.object.rotation.y));
		update.object.rotation.x = parseFloat(0);
		update.object.rotation.y = parseFloat(update.details.rY);
		update.object.rotation.z = parseFloat(0);
		
		update.velocity = parseFloat(update.object.velocity);
		update.details.pX = parseFloat(update.object.position.x);
		update.details.pZ = parseFloat(update.object.position.z);

		_complete(update);
	};

	return ships;
}