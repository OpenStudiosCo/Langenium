define(
	[
		"views/ApplicationView",
		"controllers/ApplicationController",
		"router"
	],	function(ApplicationView, ApplicationController, Router){
		var App = {
			ApplicationView: ApplicationView,
			ApplicationController: ApplicationController,
			Router: Router
		};
		return App;
	}
);

