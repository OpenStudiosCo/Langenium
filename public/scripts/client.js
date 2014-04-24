$(document).ready(function(){
	L.scenograph.director.init();	
	
	L.socket.emit('pong', { time: L.scenograph.stats.time.now });
	L.socket.on('ping', function(data){
		$('#latency .latency').html(data.latency);
		L.socket.emit('pong', { time: L.scenograph.stats.time.now });
	});

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

	L.gui.add(L.scenograph.options,'hideInterface')
	L.gui.add(L.scenograph.options,'useControls')
	L.gui.add(L.scenograph.options,'activeScene', L.scenograph.options.scenes)
});