module.exports = function() {
	var ember_app = Ember.Application.create({
		rootElement: '#container'
	});

	ember_app.ApplicationAdapter = DS.FixtureAdapter;

	ember_app.Router.map(function(){
		this.resource('games');
		this.resource('about');
		this.resource('blog', {path: '/blog/'}, function(){
			this.resource('posts', {path:'/posts/:id'})
		});
		this.resource('media');
	});

	ember_app.Posts = DS.Model.extend({
		title: DS.attr('string'),
		description: DS.attr('string')
	});

	// Chuck this in a unit test when moved to server fed data
	ember_app.Posts.FIXTURES = [
		{
			id: "0",
			title: "Article title",
			description: "Pork sausage jerky corned beef pork belly pork loin venison spare ribs shoulder tail chicken ground round. Ball tip andouille ribeye short loin, pastrami short ribs boudin hamburger cow swine filet mignon pork chop. Beef meatloaf ribeye jerky."
		},
		{
			id: "1",
			title: "Another title",
			description: "Short loin flank. Sausage short ribs tail rump tenderloin ham."
		},
		{
			id: "2",
			title: "Pork sausage",
			description: "Pork sausage jerky corned beef pork belly pork loin venison spare ribs shoulder tail chicken ground round. Ball tip andouille ribeye short loin, pastrami short ribs boudin hamburger cow swine filet mignon pork chop. Beef meatloaf ribeye jerky."
		}
	];

	ember_app.IndexRoute = Ember.Route.extend({
		model: function() {
			console.log(this.store.findAll('posts'))
			return this.store.findAll('posts');
		}
	});

	ember_app.AboutRoute = Ember.Route.extend({
		model: function() {
			return ['severe', 'green', 'purple', 'severe'];
		}
	});

	ember_app.BlogRoute = Ember.Route.extend({
		model: function() {
			return [
				{
					title: "Article title",
					post_id: "0",
					description: "Pork sausage jerky corned beef pork belly pork loin venison spare ribs shoulder tail chicken ground round. Ball tip andouille ribeye short loin, pastrami short ribs boudin hamburger cow swine filet mignon pork chop. Beef meatloaf ribeye jerky."
				},
				{
					title: "Another title",
					post_id: "1",
					description: "Short loin flank. Sausage short ribs tail rump tenderloin ham."
				},
				{
					title: "Pork sausage",
					post_id: "2",
					description: "Pork sausage jerky corned beef pork belly pork loin venison spare ribs shoulder tail chicken ground round. Ball tip andouille ribeye short loin, pastrami short ribs boudin hamburger cow swine filet mignon pork chop. Beef meatloaf ribeye jerky."
				}
			];
		}
	});

	ember_app.PostsRoute = Ember.Route.extend({
		model: function(params) {
			if (params.id) {
				return this.store.find('posts', params.id);
			}
			else {
				return this.store.findAll('posts');
			}
		}
	});

	return ember_app;
}