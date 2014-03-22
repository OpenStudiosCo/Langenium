define({
	shim: {
		"ember": {
			deps: ["handlebars", "jquery"],
			exports: "Ember"
		}
	},
	paths: {
		"App": "/scripts/app",
/* These aren't final, folders don't exist yet either :P
		"controllers": "/scripts/app/models",
		"models": "/scripts/app/models",
		"templates": "/scripts/app/templates",
		"views": "/scripts/app/models"
*/
		// libs
		"ember": "/scripts/libs/ember-1.4.0",
		"handlebars": "/scripts/libs/handlebars-v1.3.0",
		"jquery": "/scripts/libs/jquery-1.11.0",
		"three": "/scripts/libs/three",
		"testrunner": "/scripts/libs/three"
	}
});