(function(root){
	require(["config"], function(config){
		requirejs.config(config);
		require(["app", "ember"], function(App, Ember){
			root.App = App = Ember.Application.create(App);

			App.Router.map(function() {
			  // put your routes here
			});

			App.IndexRoute = Ember.Route.extend({ 
			  model: function() {
			    return ['red', 'yellow', 'blue'];
			  }
			});
		});
	});
})(this);