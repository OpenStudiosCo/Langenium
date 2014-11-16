$(document).ready(function(){
	L.scenograph.director.init();	
	
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

    L.content.loadPage(window.location.hash);
	$(window).bind('hashchange', function () { //detect hash change
        L.content.loadPage(window.location.hash);
    });

});