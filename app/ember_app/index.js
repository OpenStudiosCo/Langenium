module.exports = function (ember_app) {
	ember_app.IndexRoute = Ember.Route.extend({
		model: function() {
			return this.store.findAll('post');
		}
	});
}