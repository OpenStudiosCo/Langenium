/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Instance/Types/Outdoor
		This class defines instance type 'outdoor', which is the "flight" gameplay mode
	
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

function make(io, outdoor, objects) {
	/* 
		Returns the standard container type outdoor object
		
		Parameters:
			none
	*/
	outdoor.update_queue = [];

	outdoor.transmit_interval = 3;
	outdoor.interval_ticks = 0;

	outdoor.update = function(delta) { update(delta, io, outdoor); };

	for (var object in objects) {
		outdoor[object] = [];
	}

	return outdoor;

}

// Private function
function update(delta, io, outdoor) {

	var processed_changes = [];
	// Player velocities reduce to 0 over time
	
	outdoor.update_queue.forEach(function(update, index){
		
		var _complete = function(processed_change) {
			processed_changes.push(processed_change);
			outdoor.update_queue.splice(index, 1);
		};
		
		outdoor[update.obj_class].forEach(function(obj){
			if (obj.socket_id == update.socket_id) {
				//if (update.type == "move_character") {
					
				
				if (update.type == "move_ship" || update.type == "move_character") {
					obj.input_status = true; // determine if the ship should glide with velocity forward or not
				}
				obj[update.type](delta, obj, outdoor, update, _complete);
			}
		});
	});
	if (outdoor.interval_ticks >= outdoor.transmit_interval) {
		outdoor.interval_ticks = 0;
		outdoor.ships.forEach(function(ship){
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
		
				ship.move_ship(delta, ship, outdoor, update, _complete);
			}
			else {
				ship.input_status = false;
			}
		});
	}
	else {
		outdoor.interval_ticks++;
	}

	io.sockets.emit('update', processed_changes);
}

