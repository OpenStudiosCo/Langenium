// Initialize the Langenium client

// Load and initialize the Ember application
global.L = require('./L')()

L.Ember = Ember.Application.create();

L.Ember.Router.map(function(){
	this.resource('games');
	this.resource('about');
	this.resource('blog');
	this.resource('media');
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

