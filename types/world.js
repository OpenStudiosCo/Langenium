/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Instance/Types/World
		This class defines instance type 'world', which is the "flight" gameplay mode
	
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

function make(io, world, objects) {
	/* 
		Returns the standard container type world object
		
		Parameters:
			none
	*/
	world.update_queue = [];

	world.update = function(delta) { update(delta, io, world); };

	for (var object in objects) {
		world[object] = [];
	}

	return world;

}

// Private function
function update(delta, io, world) {
	var processed_changes = [];
	// Player velocities reduce to 0 over time
	
	world.update_queue.forEach(function(update, index){
		
		var _complete = function(processed_change) {
			processed_changes.push(processed_change);
			world.update_queue.splice(index, 1);
		};
		
		world[update.obj_class].forEach(function(obj){
			if (obj.socket_id == update.socket_id) {
				//if (update.type == "move_character") {
					
				
				if (update.type == "move_ship" || update.type == "move_character") {
					obj.input_status = true; // determine if the ship should glide with velocity forward or not
				}
				obj[update.type](delta, obj, world, update, _complete);
			}
		});
	});
	world.ships.forEach(function(ship){
		if (ship.input_status == false) {
			var _complete = function(processed_change) {
				processed_changes.push(processed_change);
			};
			ship.velocity *= .996;
			var update = {
				socket_id: ship.socket_id,
				type: "move_ship",
				username: ship.username,
				obj_class: 'players',
				details: {
					d: delta,
					pZ: 0,
					pY: 0,
					rY: 0,
					fire: false	
				}
			};
	
			ship.move_ship(delta, ship, world, update, _complete);
		}
		else {
			ship.input_status = false;
		}
	});
	io.sockets.emit('update', processed_changes);
}

