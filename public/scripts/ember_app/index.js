L.ember_app.IndexRoute = Ember.Route.extend({
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

L.ember_app.IndexView = Ember.View.extend({
	didInsertElement: function(){
		$('.slideshow').cycle({
			log: false
		});
	},
	willDestroyElement: function() {
		$('.slideshow').cycle('destroy');
	}
});
