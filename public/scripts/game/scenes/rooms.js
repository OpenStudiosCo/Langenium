/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Rooms
	This contains the classes that manage rooms
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var rooms = function() {

	return this;
};


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

rooms.prototype.add_wall = function(wall_no) {

	var top_left,
		top_right,
		bottom_left, 
		bottom_right;

	switch (wall_no) {
		case 1: 
			//Side 1 (|  )
			bottom_left = scenes.grid.object.geometry.vertices[scenes.grid.selected.triangle_1.a].clone();
			bottom_right = scenes.grid.object.geometry.vertices[scenes.grid.selected.triangle_1.b].clone();
			break;
		case 2: 
			// Side 2 ( _ )	
			bottom_left = scenes.grid.object.geometry.vertices[scenes.grid.selected.triangle_2.b].clone();
			bottom_right = scenes.grid.object.geometry.vertices[scenes.grid.selected.triangle_2.a].clone();
			break;
		case 3:
			// Side 3 (  |)
			bottom_left = scenes.grid.object.geometry.vertices[scenes.grid.selected.triangle_2.b].clone();
			bottom_right = scenes.grid.object.geometry.vertices[scenes.grid.selected.triangle_1.c].clone();
			break;
		case 4: 
			// Side 4 ( ¯ )
			bottom_left = scenes.grid.object.geometry.vertices[scenes.grid.selected.triangle_1.c].clone();
			bottom_right = scenes.grid.object.geometry.vertices[scenes.grid.selected.triangle_1.a].clone();
			break;
	}

	top_left = bottom_left.clone();
	top_left.y += 10.0;
	top_right = bottom_right.clone();
	top_right.y += 10.0;

	var geometry = new THREE.Geometry();
	geometry.vertices.push(bottom_left);
	geometry.vertices.push(top_left);
	geometry.vertices.push(top_right);
	geometry.vertices.push(bottom_right);
	geometry.vertices.push(bottom_left);

	var material = new THREE.LineBasicMaterial({
        color: 'yellow'
    });

	var bounding_box = new THREE.Line(geometry, material);
    bounding_box.name = "bounding_box";
    
    bounding_box.position.y -= 3;
    engine.scene.add(bounding_box);

}