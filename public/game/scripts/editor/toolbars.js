  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Toolbars
	This defines behaviours for the header and footer toolbars in the editor
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var toolbars = function() {
   this.mouseover = false;
   return this;
};


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// Events
$(document).ready(function(){
	$('.navbar.navbar-inverse.navbar-fixed-top li > a.btn, .navbar.navbar-inverse.navbar-fixed-bottom li > a.btn').click(toggleSubMenu);
	$('#game').click(hideAllSubMenus);	
	$('.username_menu .login').click(function(e){
		var callback = function(data) {
			if (data.username) {
				events.login(data);
				e.preventDefault();
			}
		};
		$.ajax({url:'/login_check', success: callback});
	});

});


function toggleSubMenu (e) {
	e.preventDefault();
	
	$(this).siblings('.sub_menu').slideToggle();
}

function hideAllSubMenus(e) {
	e.preventDefault();
	$('.sub_menu').slideUp();
}

toolbars.prototype.updateCameraDetails = function() {
	if (player && player.children.length > 0) {	
		client.camera_position = new THREE.Vector3().getPositionFromMatrix(client.camera.matrixWorld);
		$('.camera_info .x').html('x: ' + Math.round(client.camera_position.x));
		$('.camera_info .y').html('y: ' + Math.round(client.camera_position.y));
		$('.camera_info .z').html('z: ' + Math.round(client.camera_position.z));
	}	
}