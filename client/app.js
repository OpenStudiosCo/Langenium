module.exports = function() {
	var app = {
		name : "Langenium Client"
	};
	app.Ember = Ember.Application.create();

	console.log("Client ready")
	return app;
}

