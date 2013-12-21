/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	Website
	This binds the website's HTTP and socket routes to it's controller class


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Setup Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

module.exports = function(modules) {
	
	// Paths
	
	modules.app.get('/',modules.controllers.website.index);
	modules.app.get('/about',modules.controllers.website.page.about);
	modules.app.get('/blog',modules.controllers.website.blog.index);
	modules.app.get('/forums',modules.controllers.website.forums.list);
	modules.app.get('/forums/*',modules.controllers.website.forums.index);
	modules.app.get('/gallery',modules.controllers.website.gallery.list);
	modules.app.get('/gallery/*',modules.controllers.website.gallery.index);
	modules.app.get('/guide/*',modules.controllers.website.guide.index);
	modules.app.get('/guide/save',modules.controllers.website.guide.save);

	// Sockets
	modules.io.on('connection', function(socket) {
		// Socket actions go here
	});

}