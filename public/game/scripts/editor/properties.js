  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Editor
	This class defines editor objects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var properties = function() {
   this.mouseover = false;
   return this;
};


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Events

$("#properties").live("mouseover",function(e){
	editor.transform.mouseover = true;
	controls.enabled = false;
});
$("#properties").live("mouseout",function(e){
	editor.transform.mouseover = false;
	controls.enabled = true;
});

// Helpers
properties.prototype.makeControls = function () {
	var html = { width: 250, alignX: "left", alignY: "bottom", data: "" };
	
	return html;
};

properties.prototype.getPropertyList = function(id) {
	var html = "<h3>Properties</h3>";
	html += "<ul class='menu'>";
	for (var i in scene.__objects[id]) {
		var val = scene.__objects[id][i];
		if ((typeof(val) != "object")&&(typeof(val) != "function")) { 
			html += "<li><a href='#'>" + i + ": " + val +"</a></li>";
		}
		else {
			if (typeof(val) == "object") {
				html += "<li><a href='#'>" +i + "</a><ul>";
				for (var j in val) {
					var jval = val[j];
					if ((typeof(jval) != "object")&&(typeof(jval) != "function")) {
						if ((typeof(jval) == "string")&&(jval.length > 150)) {
							html += "<li><a href='#'>" + j + ": " + jval.substring(0,100)+"</a></li>";
						}
						else {
							html += "<li><a href='#'>" + j + ": " + jval +"</a></li>";
						}
					}
				}
				html += "</ul></li>";
			}
			else {
				//html += "<li><a href='#'>" + i + ": " + val +"</a></li>"; // functions
			}
		}
	}
	html += "</ul>";
	return html;
};

properties.prototype.onClick = function ( event ) {
	if ((editor.transform.mouseover == false)&&(editor.transform.mouseover == false)) {
		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, client.camera );
		var camera_pos = new THREE.Vector3().getPositionFromMatrix(client.camera.matrixWorld);
		var raycaster = new THREE.Raycaster( camera_pos, vector.sub( camera_pos ).normalize() );

		var intersects = raycaster.intersectObjects( scene.__objects );

		if ( intersects.length > 0 ) {
			editor.properties.loadProperties(intersects[0].object.id);
			$("#transform").html(editor.transform.makeControls().data);
			editor.transform.render();
			editor.transform.loadProperties(intersects[0].object.id);
			// ui.editor.transform.refresh(); once scaling is implemented in transform.js, this can be uncommented
		}
	}
};


properties.prototype.loadProperties = function(id) {
	// clears and populates the properties window
	for (var i in scene.__objects) {
		if (scene.__objects[i].id == id) {
			$("#properties").html(this.getPropertyList(i));
			$("#properties .menu").menu();
			if (scene.__objects[i].material.materials) {
				scene.__objects[i].material.materials.forEach(function(material){
					material.wireframe = true;
				});
			}
			else {
				scene.__objects[i].material.wireframe = true;
			}
		}
		else {
			if (scene.__objects[i].material.materials) {
				scene.__objects[i].material.materials.forEach(function(material){
					material.wireframe = false;
				});
			}
			else {
				scene.__objects[i].material.wireframe = false;
			}
		}

	}
};