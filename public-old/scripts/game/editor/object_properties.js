  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Object Properties
	This class defines editor object properties
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Initialize editor
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var object_properties = function() {
	return this;
};


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Helper Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

object_properties.prototype.add_object = function(object) {
	var html = '<option value="' + object.id + '">(' + object.id + ') ';
	html += object.name + ' [' + object.obj_details.type + '|' + object.obj_details.sub_type + '|' + object.obj_details.name + ']</option';
	$('.object_properties select.object_list').append(html);
};
$(document).ready(function(){
	$('.object_properties select.object_list').live('change', editor.object_properties.select);	
	$('.object_properties .save_status .create').live('click', editor.object_properties.create);	
	$('.object_properties .save_status .update').live('click', editor.object_properties.update);	
	$('.object_properties .save_status .delete').live('click', editor.object_properties.delete);	
});


object_properties.prototype.select = function() {
	editor.object_properties.unbind_events();
	engine.scene.children.forEach(function(scene_object, index){
		scene_object.children.forEach(function(object_child){
			if (object_child.name == "bounding_box") {
				scene_object.remove(object_child);
			}
		});
	});
	var selected_id = $('.object_properties select.object_list').val();
	engine.scene.children.forEach(function(object, index){
		if(object.id == selected_id) {
			$('.object_properties .details .instance_name p').html(object.name);
			switch(object.obj_details.status) {
				case 'Saved':
					$('.object_properties .details .save_status p').html('Saved ('+object.obj_details.instance_id + ')');	
					$('.object_properties .details .save_status p').append('<a href="#" class="btn btn-inverse delete"><i class="icon-trash" /></a>');	
					break;
				case 'Modified':
					$('.object_properties .details .save_status p').html('<a href="#" class="btn btn-inverse update"><i class="icon-save" /></a>');
					break;
				case 'New':
					$('.object_properties .details .save_status p').html('<a href="#" class="btn btn-inverse create"><i class="icon-save" /></a>');
					break;
				default:
					$('.object_properties .details .save_status p').html('Unknown');
			}

			$('.object_properties .details .type p').html(object.obj_details.type + ' | ' + object.obj_details.sub_type);
			$('.object_properties .details .library_name p').html(object.obj_details.name);

			$('.object_properties .transform .position .x').val(object.position.x);
			$('.object_properties .transform .position .y').val(object.position.y);
			$('.object_properties .transform .position .z').val(object.position.z);

			$('.object_properties .transform .scale input').val(object.scale.x);

			$('.object_properties .transform .rotation .x').val(object.rotation.x);
			$('.object_properties .transform .rotation .y').val(object.rotation.y);
			$('.object_properties .transform .rotation .z').val(object.rotation.z);

			$('.object_properties .transform .increments input').val(object.scale.x / 10);

			object.geometry.computeBoundingBox();
			editor.object_properties.bind_events(object);
			editor.object_properties.draw_bounding_box(object, object.position, object.geometry.boundingBox.max, object.geometry.boundingBox.min, object.scale.x);
		}
	});
	
};

object_properties.prototype.draw_bounding_box = function(object, position, max, min, scale) {

	var material = new THREE.LineBasicMaterial({
        color: 'yellow'
    });

    var geometry = new THREE.Geometry();
    // Bottom square
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z));
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z));
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z));
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z));
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z));
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z));
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z));

    var bounding_box = new THREE.Line(geometry, material);
    bounding_box.name = "bounding_box";
    
    object.add(bounding_box);
};

object_properties.prototype.transform_object = function(object, property, sub_property, value) {
	if (object.children.length > 0) {
		console.log(object.children);
	}
	if (sub_property) {
		object[property][sub_property] = value;
	}
	else {
		object[property] = value;
	}

};

object_properties.prototype.bind_events = function(object) {
	var increment = parseFloat($('.object_properties .increments input').val());
	var radian = Math.PI / 180;

	$('.object_properties .position .x input').keyup(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'position', 'x', $(this).val()); });
	$('.object_properties .position .y input').keyup(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'position', 'y', $(this).val()); });
	$('.object_properties .position .z input').keyup(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'position', 'z', $(this).val()); });

	$('.object_properties .position .x .add').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'position', 'x', object.position.x + increment); $(this).siblings('input').val(object.position.x); });
	$('.object_properties .position .y .add').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'position', 'y', object.position.y + increment); $(this).siblings('input').val(object.position.y); });
	$('.object_properties .position .z .add').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'position', 'z', object.position.z + increment); $(this).siblings('input').val(object.position.z); });
	$('.object_properties .position .x .minus').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'position', 'x', object.position.x - increment); $(this).siblings('input').val(object.position.x); });
	$('.object_properties .position .y .minus').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'position', 'y', object.position.y - increment); $(this).siblings('input').val(object.position.y); });
	$('.object_properties .position .z .minus').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'position', 'z', object.position.z - increment); $(this).siblings('input').val(object.position.z); });

	$('.object_properties .scale input').keyup(function(e){ 
		editor.object_properties.modified(); 
		editor.object_properties.transform_object(object, 'scale', 'x', $(this).val()); 
		editor.object_properties.transform_object(object, 'scale', 'y', $(this).val()); 
		editor.object_properties.transform_object(object, 'scale', 'z', $(this).val()); 
	});

	$('.object_properties .scale .add').click(function(e) { 
		editor.object_properties.modified(); 
		$(this).siblings('input').val(object.scale.x + increment); 
		editor.object_properties.transform_object(object, 'scale', 'x', object.scale.x + increment); 
		editor.object_properties.transform_object(object, 'scale', 'y', object.scale.y + increment); 
		editor.object_properties.transform_object(object, 'scale', 'z', object.scale.z + increment); 
	});
	$('.object_properties .scale .minus').click(function(e) { 
		editor.object_properties.modified(); 
		$(this).siblings('input').val(object.scale.x - increment); 
		editor.object_properties.transform_object(object, 'scale', 'x', object.scale.x - increment); 
		editor.object_properties.transform_object(object, 'scale', 'y', object.scale.y - increment); 
		editor.object_properties.transform_object(object, 'scale', 'z', object.scale.z - increment); 
	});

	$('.object_properties .rotation .x input').keyup(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'rotation', 'x', $(this).val()); });
	$('.object_properties .rotation .y input').keyup(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'rotation', 'y', $(this).val()); });
	$('.object_properties .rotation .z input').keyup(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'rotation', 'z', $(this).val()); });

	$('.object_properties .rotation .x .add').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'rotation', 'x', object.rotation.x + radian); $(this).siblings('input').val(object.rotation.x); });
	$('.object_properties .rotation .y .add').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'rotation', 'y', object.rotation.y + radian); $(this).siblings('input').val(object.rotation.y); });
	$('.object_properties .rotation .z .add').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'rotation', 'z', object.rotation.z + radian); $(this).siblings('input').val(object.rotation.z); });
	$('.object_properties .rotation .x .minus').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'rotation', 'x', object.rotation.x - radian); $(this).siblings('input').val(object.rotation.x); });
	$('.object_properties .rotation .y .minus').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'rotation', 'y', object.rotation.y - radian); $(this).siblings('input').val(object.rotation.y); });
	$('.object_properties .rotation .z .minus').click(function(e){ editor.object_properties.modified(); editor.object_properties.transform_object(object, 'rotation', 'z', object.rotation.z - radian); $(this).siblings('input').val(object.rotation.z); });

	$('.object_properties .increments').keyup(function(e){
		$(this).siblings('input').val($(this).val());
		editor.object_properties.unbind_events();
		editor.object_properties.bind_events(object);
	});
};

object_properties.prototype.unbind_events = function() {
		$('.object_properties .add').unbind();
		$('.object_properties .minus').unbind();
		$('.object_properties input').unbind();
};

object_properties.prototype.modified = function() {
	if (object.obj_details.status == 'Saved') {
		var selected_id = $('.object_properties select.object_list').val();
		engine.scene.children.forEach(function(object, index){
			if(object.id == selected_id) {
				object.obj_details.status = 'Modified';
			}
		});
		$('.object_properties .details .save_status p').html('<a href="#" class="btn btn-inverse update"><i class="icon-save" /></a>');
	}
}

object_properties.prototype.create = function(e){
	var selected_id = $('.object_properties select.object_list').val();
	engine.scene.children.forEach(function(object, index){
		if(object.id == selected_id) {
			
			var create_details = {
				object_id: object.obj_details.object_id,
				pX: object.position.x,
				pY: object.position.y,
				pZ: object.position.z,
				rX: object.rotation.x,
				rY: object.rotation.y,
				rZ: object.rotation.z,
				scale: object.scale.x,
				obj_class: object.name, // this seems dodge but keeping consistent for now
				sub_type: object.obj_details.sub_type,
				type: object.obj_details.type,
				name: object.obj_details.name
			};
			$.ajax({
				url: '/editor/create_object',
				data: create_details,
				success: function(data) {
					if (data != 0) {
						object.obj_details.status = 'Saved';
						object.obj_details._id = data;
						$('.object_properties .details .save_status p').html('Saved ('+ data + ')');
						$('.object_properties .details .save_status p').append('<a href="#" class="btn btn-inverse delete"><i class="icon-trash" /></a>');	
					}
				}
			});
		}
	});
}
object_properties.prototype.update = function(e){
	var selected_id = $('.object_properties select.object_list').val();
	engine.scene.children.forEach(function(object, index){
		if(object.id == selected_id) {
			var create_details = {
				_id: object.obj_details._id,
				object_id: object.obj_details.object_id,
				pX: object.position.x,
				pY: object.position.y,
				pZ: object.position.z,
				rX: object.rotation.x,
				rY: object.rotation.y,
				rZ: object.rotation.z,
				scale: object.scale.x,
				obj_class: object.name, // this seems dodge but keeping consistent for now
				sub_type: object.obj_details.sub_type,
				type: object.obj_details.type,
				name: object.obj_details.name
			};
			$.ajax({
				url: '/editor/update_object',
				data: create_details,
				success: function(data) {
					console.log(data);
					if (data != 0) {
						object.obj_details.status = 'Saved';
						$('.object_properties .details .save_status p').html('Saved ('+ data + ')');
						$('.object_properties .details .save_status p').append('<a href="#" class="btn btn-inverse delete"><i class="icon-trash" /></a>');	
					}
				}
			});
		}
	});
}
object_properties.prototype.delete = function(e){
	var selected_id = $('.object_properties select.object_list').val();
	engine.scene.children.forEach(function(object, index){
		if(object.id == selected_id) {
			$.ajax({
				url: '/editor/delete_object',
				data: { _id: object.obj_details.instance_id, obj_class: object.name },
				success: function(data) {
					if (data != 0) {
						object.parent.remove(object);
						console.log('Object deleted');
					}
				}
			});
		}
	});
}