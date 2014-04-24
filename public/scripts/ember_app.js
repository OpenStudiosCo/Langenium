L.ember_app = Ember.Application.create({
	rootElement: '#container',
	ready: function() {
		console.log("Ember application ready");
	}
});

L.ember_app.ApplicationAdapter = DS.FixtureAdapter;

L.ember_app.Router.map(function(){
	this.resource('games',{ path: '/games/'}, function(){
		this.resource('epoch-exordium');
		this.resource('mmo');
		this.resource('prototypes', {path:'/prototypes/:id'});
	});
	this.resource('about');
	this.resource('blog', {path: '/blog/'}, function(){
		this.resource('posts', {path:'/posts/:id'})
		this.resource('article', {path:'/article/:id'})
	});
	this.resource('media');
});

