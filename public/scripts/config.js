define({
	shim: {
		"ember": {
			deps: ["handlebars", "jquery"],
			exports: "Ember"
		}
	},
	paths: {
		"app": "/scripts/app",
/* These aren't final, folders don't exist yet either :P
		"controllers": "/scripts/app/models",
		"models": "/scripts/app/models",
		"templates": "/scripts/app/templates",
		"views": "/scripts/app/models"
*/
		// libs
		"ember": "/scripts/vendor/ember-1.4.0",
		"handlebars": "/scripts/vendor/handlebars-v1.3.0",
		"jquery": "/scripts/vendor/jquery-1.11.0",
		"three": "/scripts/vendor/three",
		"testrunner": "/scripts/vendor/three"
	}
});