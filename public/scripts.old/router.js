modules.exports = function() {
	var Router = Ember.Router.extend({
		location: 'hash',
		enableLogging: true,
		root: Ember.Route.extend({
			index: Ember.Route.extend({
				route: "/",
				model: function() {
			    	return ['red', 'yellow', 'blue'];
				}
			}),
			about: Ember.Route.extend({
				route: "/about",
				model: function() {
			    	return ['red', 'yellow', 'blue'];
			  	}
			})
		})
	});
	return Router;
}
