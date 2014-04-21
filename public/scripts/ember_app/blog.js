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
	title: DS.attr('string'),
	created: DS.attr('date'),
	description: DS.attr('string')
});
// Manually updated via this array for now, will move to some kind of socket based Markdown grabber
L.ember_app.Post.FIXTURES = [
	{
		id: "0",
		created: "22/4/2014",
		title: "First post!",
		description: "This is a placeholder first post for the new website"
	}
];
