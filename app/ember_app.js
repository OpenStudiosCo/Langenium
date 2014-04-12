module.exports = function() {
	var ember_app = Ember.Application.create();

	ember_app.Router.map(function(){
		this.resource('games');
		this.resource('about');
		this.resource('blog');
		this.resource('media');
	});

	ember_app.IndexRoute = Ember.Route.extend({
		model: function() {
			return ['red', 'yellow', 'blue'];
		}
	});

	ember_app.AboutRoute = Ember.Route.extend({
		model: function() {
			return ['severe', 'green', 'purple', 'severe'];
		}
	});

	return ember_app;
}