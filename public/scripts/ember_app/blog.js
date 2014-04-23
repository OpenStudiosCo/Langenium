L.ember_app.BlogRoute = Ember.Route.extend({
	model: function() {
		return this.store.findAll('post');
	}
});

L.ember_app.PostsRoute = Ember.Route.extend({
	model: function(params) {
		return this.store.find('post', params.id);
	}
});

L.ember_app.Post = DS.Model.extend({
	created_time: DS.attr('date'),
	name: DS.attr('string'),
	description: DS.attr('string'),
	link: DS.attr('string'),
	picture: DS.attr('string'),
	status_type: DS.attr('string'),
	type: DS.attr('string')
});

L.ember_app.Post.FIXTURES = [];