$(document).ready(function(){
	L.scenograph.director.init();	
	
	L.socket.on('ping', function(data){
		$('#latency .latency').html(data.latency);
		L.socket.emit('pong', { time: L.scenograph.stats.time.now });
	});

	L.socket.emit('pong', { time: L.scenograph.stats.time.now });	
	
	L.gui.add(L.scenograph.options,'hideInterface')
	L.gui.add(L.scenograph.options,'useControls')
	L.gui.add(L.scenograph.options,'activeScene', L.scenograph.options.scenes)
	
	var loadPage = function(page) {
		$('#viewport .slideshow').cycle('destroy');
    	if (page == '#/' || page == '') {
			page = '#home';
		} 
		else {
			page = page.replace('#/','#');
		}

		$('#page').html($('#pages ' + page).html());
		$('#viewport .slideshow').cycle({
			slides: '> .slide'
		});
    }

	loadPage(window.location.hash);

	$(window).bind('hashchange', function () { //detect hash change
        loadPage(window.location.hash);
    });

});