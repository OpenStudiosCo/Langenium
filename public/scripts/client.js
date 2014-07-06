$(document).ready(function(){
	L.scenograph.director.init();	
	
	L.socket.on('ping', function(data){
		L.scenograph.stats.latency.append(
			L.scenograph.stats.time.now,
			data.latency
		);
		L.socket.emit('pong', { time: L.scenograph.stats.time.now });
	});

	L.socket.emit('pong', { time: L.scenograph.stats.time.now });

	L.socket.on('content', function(data){
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
	
	L.gui.add(L.scenograph.options,'hideInterface');
	L.gui.add(L.scenograph.options,'useControls');
	L.gui.add(L.scenograph.options,'editMode');
	L.gui.add(L.scenograph.options,'activeScene', L.scenograph.options.scenes);

	var latency_gui = L.gui.addFolder("Latency");
	$(latency_gui.domElement).children('ul:first').append('<li class="chart"><canvas id="latency" width="245" height="100"></canvas></li>');
	$(latency_gui.domElement).children('.title').click(function(e){
		e.preventDefault();
        _this.closed = !_this.closed;
        return false;
	});
	latency_gui.open();
	var chart = new SmoothieChart();
    chart.addTimeSeries(L.scenograph.stats.latency, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 1 });
    chart.streamTo(document.getElementById("latency"), 500);

    var fps_gui = L.gui.addFolder("FPS");
    $(fps_gui.domElement).children('ul:first').append('<li class="chart"><canvas id="fps" width="245" height="100"></canvas></li>');
	$(fps_gui.domElement).children('.title').click(function(e){
		e.preventDefault();
        _this.closed = !_this.closed;
        return false;
	});
	fps_gui.open();
    chart = new SmoothieChart();
    chart.addTimeSeries(L.scenograph.stats.fps.now, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 1 });
    chart.streamTo(document.getElementById("fps"), 500);

    $('.dg .c select').on('change', function(e){
    	this.blur();
    });

	var loadPage = function(page) {
		$('#page').addClass('fadeOutUp');
		$('#page').removeClass('fadeInDown');
    	if (page == '#/' || page == '') {
			page = 'home';
		} 
		else {
			page = page.replace('#/','');
		}

		var params = page.split('/');
		
		
		$('#page.fadeOutUp').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			$('#viewport .slideshow').cycle('destroy');
			if (params.length > 1) {
				L.socket.emit('content',params)
			}
			else {
				$('#page').html($('#pages #' + page).html());
				$('#viewport .slideshow').cycle({
					slides: '> .slide'
				});		
				$('#page').addClass('fadeInDown');
				$('#page').removeClass('fadeOutUp');
			}
		});		
    }
	loadPage(window.location.hash);

	$(window).bind('hashchange', function () { //detect hash change
        loadPage(window.location.hash);
    });

});