$(document).ready(function(){
	L.scenograph.director.init();	
	L.socket = io.connect(window.location.hostname);
	L.socket.emit('pong', { time: L.scenograph.stats.time.now });
	L.socket.on('ping', function(data){
		$('#latency .latency').html(data.latency);
		L.socket.emit('pong', { time: L.scenograph.stats.time.now });
	});
	L.gui.add(L.scenograph.options,'useControls')
	L.gui.add(L.scenograph.options,'activeScene', L.scenograph.options.scenes)
});