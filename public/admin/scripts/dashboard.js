/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Dashboard
	This class contains functions for the dashboard page monitoring and console widgets
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
var 	socket,
		cpu_chart,
		memory_chart,
		prev_data;

var line_styles = [
	{ 
		strokeStyle: 'rgba(255, 0, 0, 1)', 
		lineWidth: 1 
	},
	{
		strokeStyle: 'rgba(0, 255, 0, 1)', 
		lineWidth: 1 
	},
	{ 
		strokeStyle: 'rgba(0, 0, 255, 1)', 
		lineWidth: 1 
	},
	{ 
		strokeStyle: 'rgba(255, 255, 0, 1)', 
		lineWidth: 1 
	}
];

$(document).ready(function(){
	socket = setEventHandlers(
        io.connect(getSocketURL())
    );
});

function getSocketURL() {
	if (window.location.href.indexOf("dev.langenium") >= 0)
	{
		return "http://dev.langenium.com:8080"; // own port "8080"
		
	}
	else {
		return "http://langenium.com:8080";
	}
}

function setEventHandlers(socket) {
	socket.emit("server_stats");
	socket.on("server_stats", function(data) { 
		var timestamp = new Date().getTime();
		// CPU chart
		if (!cpu_chart) {
			cpu_chart = new SmoothieChart();
			cpu_chart.streamTo(document.getElementById("cpu_chart"), 500);
			data.cpu.forEach(function(cpu, index){
				cpu_chart.addTimeSeries(new TimeSeries(), line_styles[index]);
			});
		} 
		else {
			data.cpu.forEach(function(cpu, index){
				var total = 0;

				for (type in cpu.times)
					total += cpu.times[type];

				cpu_chart.seriesSet[index].timeSeries.append(timestamp, Math.round(100 * (cpu.times.user / total)));
			});
		}

		// Memory chart
		// Yellow is used
		// Green is total
		if (!memory_chart) {
			memory_chart = new SmoothieChart();
			memory_chart.streamTo(document.getElementById("memory_chart"), 500);
			
			memory_chart.addTimeSeries(new TimeSeries(), line_styles[0]);
			memory_chart.addTimeSeries(new TimeSeries(), line_styles[1]);
			
		}
		else {
			// Process 
			memory_chart.seriesSet[0].timeSeries.append(timestamp, Math.round(100 * (data.memory.usage.heapUsed / data.memory.usage.heapTotal)));
			// System
			memory_chart.seriesSet[1].timeSeries.append(timestamp, Math.round(100 * (data.memory.free / data.memory.total)));
		}

		socket.emit("server_stats");
	});
}