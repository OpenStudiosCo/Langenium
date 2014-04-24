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

/*
	L.socket.on('ember-data', function(payload){
		console.log(payload)
		var handleNews =  function(data) {
			for (var i = 0; i < data.length; i++) {
				var text = data[i].message || data[i].description;
				L.ember_app.News.store.push('news', {
					id: i,
					created_time: moment.unix(data[i].created_time).format('Do MMMM YYYY, h:mm:ss a'),
					cut_message: text.split('\n')[0],
					message: text.replace('\n','<br>'),
					link: data[i].attachment.href,
					picture: data[i].attachment.media[0].src,
					type: data[i].type
				});
			}
		}
		var handleArticles = function(data) {
			for (var i = 0; i < data.length; i++) {
				L.ember_app.Article.store.push('article', {
					id: i,
					created_time: moment.unix(data[i].created_time).format('Do MMMM YYYY, h:mm:ss a'),
					title: data[i].title,
					content: data[i].content,
					picture: $(data[i].content_html).find('img:first').attr('src').replace('_a.','_n.'),
					content_html: data[i].content_html
				});
			}
		}
		switch(payload.request.type){
			case "news":
				handleNews(payload.result);
				break;
			case "articles":
				handleArticles(payload.result);
				break;
		}
	});
*/