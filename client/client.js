// Initialize the Langenium client

global.L = require('./app')()

L.Ember.Router.map(function(){
	this.route('about', { 
		path: '/about'
	});
});

L.Ember.IndexRoute = Ember.Route.extend({
	model: function() {
		return ['red', 'yellow', 'blue'];
	}
});

L.Ember.AboutRoute = Ember.Route.extend({
	model: function() {
		return ['severe', 'green', 'purple', 'severe'];
	}
});