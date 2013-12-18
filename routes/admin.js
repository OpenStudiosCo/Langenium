/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Admin
	This binds the admin's HTTP and socket outes to it's controller class


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Setup Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

module.exports = function(modules) {
	
	// Paths
	modules.app.get('/admin', modules.controllers.admin.dashboard.index);

	modules.app.get('/admin/mechanics', modules.controllers.admin.game_management.mechanics.index);
	modules.app.get('/admin/object_editor', modules.controllers.admin.game_management.object_editor.index);
	modules.app.get('/admin/scene_director', modules.controllers.admin.game_management.scene_director.index);
	modules.app.get('/admin/texture_painter', modules.controllers.admin.game_management.texture_painter.index);
			
	// Sockets
	modules.io.on('connection', function(socket) {
		socket.on('admin:dashboard:server_stats:subscribe', function () { modules.controllers.admin.dashboard.server_stats.subscribe(socket) });
		socket.on('admin:dashboard:server_log:subscribe', function () { modules.controllers.admin.dashboard.server_log.subscribe(socket) });
	});



}