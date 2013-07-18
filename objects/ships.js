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
function make(details, THREE) {
	/* 
		Adds a ship to the world
		
		Parameters:
			username - ship username
	*/

	details.move_ship = function (delta, ship, world, update, _complete) {
		/*
			if (details.client_position) {
				console.log("Client:")
				console.log(details.client_position);	
				console.log("Server:")
				console.log(ship.position);	
			}
		*/
		
		ship.d = delta;
		update.details.socket_id = update.socket_id;
		update.details.username = ship.username;
		var 		velocityYChange = 3.3333,
					rotateAngle = 0.01744444444444444444444444444444 * 2;

		if (ship.editor == true) {
			velocityYChange *= 100;
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
		
		update.velocity = parseFloat(ship.velocity);
		update.details.pX = parseFloat(ship.position.x);
		update.details.pZ = parseFloat(ship.position.z);
		/*
		var moveVector = new THREE.Vector3(update.details.pX, update.details.pY, update.details.pZ);
		var playerPositionVector = new THREE.Vector3(ship.position.x, ship.position.y, ship.position.z);

		var collisions = detectCollision(playerPositionVector, moveVector, world.environment);

		if (collisions.length > 0) {
			collisions.forEach(function(collision, index){

				if (collision.distance < 90) {
					if (collision.point.x > playerPosition.x) 
						{ data.rY -= collision.distance / 10000; }
					if (collision.point.x < playerPosition.x) 
						{ data.rY += collision.distance / 10000; }

					if (data.pX != 0) {
						data.pX *= -.001;
					}
					if (data.pY != 0) {
						data.pY *= -.001;
					}
					if (data.pZ != 0) {
						data.pZ *= -.001;
					}
				}
			}); 
		}
		*/
		_complete(update);
	};

	return details;
}

function detectCollision(source, direction, world_map) {
	var raycaster = new THREE.Raycaster(source, direction.normalize());
	var intersects = raycaster.intersectObjects(world_map);
	return intersects;
}