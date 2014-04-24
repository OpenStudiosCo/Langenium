L.ember_app.BlogRoute = Ember.Route.extend({
	model: function() {
		if (this.store.all('news').get('length') == 0) {
			L.socket.emit('ember-data',{ type: 'news' });
		}
		if (this.store.all('article').get('length') == 0) {
			L.socket.emit('ember-data',{ type: 'articles' });
		}
		return Ember.RSVP.hash({
			news: this.store.findAll('news'),
			articles: this.store.findAll('article')
		});
	}
});

L.ember_app.PostsRoute = Ember.Route.extend({
	model: function(params) {
		return this.store.find('news', params.id);
	}
});

L.ember_app.ArticleRoute = Ember.Route.extend({
	model: function(params) {
		return this.store.find('article', params.id);
	}
});

L.ember_app.News = DS.Model.extend({
	created_time: DS.attr('date'),
	cut_message: DS.attr('string'),
	message: DS.attr('string'),
	link: DS.attr('string'),
	picture: DS.attr('string'),
	type: DS.attr('string')
});

L.ember_app.News.FIXTURES = [];

L.ember_app.Article = DS.Model.extend({
	title: DS.attr('string'),
	created_time: DS.attr('date'),
	content: DS.attr('string'),
	picture: DS.attr('string'),
	content_html: DS.attr('string')
});

L.ember_app.Article.FIXTURES = [];