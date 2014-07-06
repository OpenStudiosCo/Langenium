L.socket.on('ping', function(data){
	L.scenograph.stats.latency.append(
		L.scenograph.stats.time.now,
		data.latency
	);
	L.socket.emit('pong', { time: L.scenograph.stats.time.now });
});

L.socket.emit('pong', { time: L.scenograph.stats.time.now });

L.socket.on('content', function(data){
	console.log(data)
	if (window.location.hash.replace('#/','') == data.request.join('/')) {
		$('#page').html($('#pages #' + data.request[0]).html());
		$('#content').html(data.response);
		$('#viewport .slideshow').cycle({
			slides: '> .slide'
		});		
		$('#page').addClass('fadeInDown');	
		$('#page').removeClass('fadeOutUp');
	}
});