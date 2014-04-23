L.ember_app.IndexRoute = Ember.Route.extend({
	model: function() {
		return this.store.findAll('post');
	}
});

L.ember_app.IndexView = Ember.View.extend({
	didInsertElement: function(){
		if (L.ember_app.Post.store.all('post').get('length') < 25) {
			L.socket.emit('ember-data',{url:'/Langenium/posts'});
		}
		$('.slideshow').cycle({
			log: false
		});
	},
	willDestroyElement: function() {
		$('.slideshow').cycle('destroy');
	}
});
