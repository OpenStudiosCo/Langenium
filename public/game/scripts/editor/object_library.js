  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Object Library
	This defines behaviours for the object library menu and window in the editor
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var object_library = function() {
	this.preview_camera = new THREE.PerspectiveCamera( 45, (330/330), 1, M * 2 );
	this.preview_renderer = new THREE.WebGLRenderer({
		antialias : true
	});
	
	this.preview_renderer.setSize( 330, 330);

	this.preview = new THREE.Scene();

	$("#object_preview").append(this.preview_renderer.domElement);
	setInterval(function(){
		
		editor.object_library.preview.children.forEach(function(child) {
			child.rotation.y += 0.01;
			child.rotation.x += 0.001;
		});
		editor.object_library.preview_renderer.render( editor.object_library.preview, editor.object_library.preview_camera );	
	}, 1000 / 66);
	
	return this;
};


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

object_library.prototype.previewObject = function (_id, name, type, sub_type, url, scale) {
	
	$('.object_library table tr.name td.value').html(name);
	$('.object_library table tr.type td.value').html(type);
	$('.object_library table tr.sub_type td.value').html(sub_type);
	$('.object_library a.button.add').attr('onclick','editor.object_library.addObject("'+_id+'","'+name+'","'+type+'","'+sub_type+'","'+url+'","'+scale+'")');

	var loader = new THREE.JSONLoader();
	loader.load(url, function(geometry, materials) {
		if (editor.object_library.preview.children.length > 0) {
			editor.object_library.preview.children.forEach(function(obj){
				editor.object_library.preview.remove(obj);
			});
		}
		var useVertexOverrides = false;
		if ((type != "terrain")&&(type != "ships")&&(type != "bots")) {
			useVertexOverrides = true;
		}

		textures.prepare(geometry, materials, useVertexOverrides);
		
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ) );
		mesh.geometry.computeBoundingBox();
		mesh.position.set(0.0,0.0,0.0);
		mesh.rotation.set(0.0,0.0,0.0);
		mesh.scale.set(100, 100, 100);
		mesh.matrixAutoUpdate = true;
		mesh.updateMatrix();
		mesh.geometry.colorsNeedUpdate = true;

		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
		hemiLight.name = "light1";
		hemiLight.color.setRGB( 0.9, 0.95, 1 );
		hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
		hemiLight.position.set( 0, M, 0 );
		editor.object_library.preview.add( hemiLight );
		editor.object_library.preview.add(mesh);
		editor.object_library.preview_camera.position.y = -100 / 2;
		editor.object_library.preview_camera.position.z = 15 * 100;

	});
}

object_library.prototype.addObject = function (_id, name, type, sub_type, url, scale) {
	
	var new_position = new THREE.Vector3(client.camera_position.x, client.camera_position.y, client.camera_position.z);

	new_position.x -= Math.sin(player.rotation.y) * 1000;
	new_position.z -= Math.cos(player.rotation.y) * 1000;

	if (controls.editor.enabled == true) {
		new_position.y -= 20000;
	}

	var instruction = {
		class: 'environment',
		instance_id: "master",
		scale: scale,
		url: url,
		position: {
			x: new_position.x,
			y: new_position.y,
			z: new_position.z,
		},
		rotation: {
			x: 0,
			y: 0,
			z: 0,
		},
		object: {
			_id: _id,
			name: name,
			type: type,
			sub_type: sub_type
		},
		status: 'New'
	};

	objects.loadObject(instruction);

}