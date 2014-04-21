L.ember_app.IndexRoute = Ember.Route.extend({
	model: function() {
		return this.store.findAll('post');
	}
});

L.ember_app.IndexView = Ember.View.extend({
	didInsertElement: function(){
		$('.slideshow').cycle();
	}
});