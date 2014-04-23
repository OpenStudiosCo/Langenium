$(document).ready(function(){
	L.scenograph.director.init();	
	
	L.socket.emit('pong', { time: L.scenograph.stats.time.now });
	L.socket.on('ping', function(data){
		$('#latency .latency').html(data.latency);
		L.socket.emit('pong', { time: L.scenograph.stats.time.now });
	});

	L.socket.on('ember-data', function(payload){
		console.log(payload)
		var handleFeedArray =  function(data) {
			for (var i = 0; i < data.length; i++) {
				L.ember_app.Post.store.push('post', {
					id: i,
					created_time: data[i].created_time,
					name: data[i].name || data[i].story,
					description: data[i].description || data[i].story,
					link: data[i].link,
					picture: data[i].picture,
					status_type: data[i].status_type,
					type: data[i].type
				});
				
			}

		}
		switch(payload.request.url){
			case "/Langenium/posts":
				handleFeedArray(payload.result.data);
		}
	});

	L.gui.add(L.scenograph.options,'useControls')
	L.gui.add(L.scenograph.options,'activeScene', L.scenograph.options.scenes)
});