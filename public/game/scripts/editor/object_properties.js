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
});


object_properties.prototype.select = function() {
	editor.object_properties.unbind_events();
	scene.children.forEach(function(scene_object, index){
		scene_object.children.forEach(function(object_child){
			if (object_child.name == "bounding_box") {
				scene_object.remove(object_child);
			}
		});
	});
	var selected_id = $('.object_properties select.object_list').val();
	scene.children.forEach(function(object, index){
		if(object.id == selected_id) {
			$('.object_properties .details .instance_name p').html(object.name);
			$('.object_properties .details .save_status p').html('Not implemented');
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
	if (sub_property) {
		object[property][sub_property] = value;
	}
	else {
		object[property] = value;
	}

};

object_properties.prototype.bind_events = function(object) {
	var increment = parseFloat($('.object_properties .increments input').val());
	
	$('.object_properties .position .x input').keyup(function(e){ editor.object_properties.transform_object(object, 'position', 'x', $(this).val()); });
	$('.object_properties .position .y input').keyup(function(e){ editor.object_properties.transform_object(object, 'position', 'y', $(this).val()); });
	$('.object_properties .position .z input').keyup(function(e){ editor.object_properties.transform_object(object, 'position', 'z', $(this).val()); });

	$('.object_properties .position .x .add').click(function(e){ editor.object_properties.transform_object(object, 'position', 'x', object.position.x + increment); $(this).siblings('input').val(object.position.x); });
	$('.object_properties .position .y .add').click(function(e){ editor.object_properties.transform_object(object, 'position', 'y', object.position.y + increment); $(this).siblings('input').val(object.position.y); });
	$('.object_properties .position .z .add').click(function(e){ editor.object_properties.transform_object(object, 'position', 'z', object.position.z + increment); $(this).siblings('input').val(object.position.z); });
	$('.object_properties .position .x .minus').click(function(e){ editor.object_properties.transform_object(object, 'position', 'x', object.position.x - increment); $(this).siblings('input').val(object.position.x); });
	$('.object_properties .position .y .minus').click(function(e){ editor.object_properties.transform_object(object, 'position', 'y', object.position.y - increment); $(this).siblings('input').val(object.position.y); });
	$('.object_properties .position .z .minus').click(function(e){ editor.object_properties.transform_object(object, 'position', 'z', object.position.z - increment); $(this).siblings('input').val(object.position.z); });

	$('.object_properties .scale input').keyup(function(e){ 
		editor.object_properties.transform_object(object, 'scale', 'x', $(this).val()); 
		editor.object_properties.transform_object(object, 'scale', 'y', $(this).val()); 
		editor.object_properties.transform_object(object, 'scale', 'z', $(this).val()); 
	});

	$('.object_properties .scale .add').click(function(e) { 
		$(this).siblings('input').val(object.scale.x + increment); 
		editor.object_properties.transform_object(object, 'scale', 'x', object.scale.x + increment); 
		editor.object_properties.transform_object(object, 'scale', 'y', object.scale.y + increment); 
		editor.object_properties.transform_object(object, 'scale', 'z', object.scale.z + increment); 
	});
	$('.object_properties .scale .minus').click(function(e) { 
		$(this).siblings('input').val(object.scale.x - increment); 
		editor.object_properties.transform_object(object, 'scale', 'x', object.scale.x - increment); 
		editor.object_properties.transform_object(object, 'scale', 'y', object.scale.y - increment); 
		editor.object_properties.transform_object(object, 'scale', 'z', object.scale.z - increment); 
	});

	$('.object_properties .rotation .x input').keyup(function(e){ editor.object_properties.transform_object(object, 'rotation', 'x', $(this).val()); });
	$('.object_properties .rotation .y input').keyup(function(e){ editor.object_properties.transform_object(object, 'rotation', 'y', $(this).val()); });
	$('.object_properties .rotation .z input').keyup(function(e){ editor.object_properties.transform_object(object, 'rotation', 'z', $(this).val()); });

	$('.object_properties .rotation .x .add').click(function(e){ editor.object_properties.transform_object(object, 'rotation', 'x', object.rotation.x + increment); $(this).siblings('input').val(object.rotation.x); });
	$('.object_properties .rotation .y .add').click(function(e){ editor.object_properties.transform_object(object, 'rotation', 'y', object.rotation.y + increment); $(this).siblings('input').val(object.rotation.y); });
	$('.object_properties .rotation .z .add').click(function(e){ editor.object_properties.transform_object(object, 'rotation', 'z', object.rotation.z + increment); $(this).siblings('input').val(object.rotation.z); });
	$('.object_properties .rotation .x .minus').click(function(e){ editor.object_properties.transform_object(object, 'rotation', 'x', object.rotation.x - increment); $(this).siblings('input').val(object.rotation.x); });
	$('.object_properties .rotation .y .minus').click(function(e){ editor.object_properties.transform_object(object, 'rotation', 'y', object.rotation.y - increment); $(this).siblings('input').val(object.rotation.y); });
	$('.object_properties .rotation .z .minus').click(function(e){ editor.object_properties.transform_object(object, 'rotation', 'z', object.rotation.z - increment); $(this).siblings('input').val(object.rotation.z); });

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