module.exports = function() {
	var ember_app = Ember.Application.create({
		rootElement: '#container'
	});

	ember_app.Router.map(function(){
		this.resource('games');
		this.resource('about');
		this.resource('blog', {path: '/blog/'}, function(){
			this.resource('posts', {path:'/posts/:post_id'})
		});
		this.resource('media');
	});

	ember_app.IndexRoute = Ember.Route.extend({
		model: function() {
			return { 
				news: [
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
				]
			};
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
			var model = [
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
			if (params.post_id) {
				return model[params.post_id];
			}
			else {
				return model;
			}
		}
	});

	return ember_app;
}