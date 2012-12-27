var url = window.location.href;
if (url.indexOf("langenium") > 0)
{
	url = "http://langenium.jit.su:80";
	url = "langenium.ap01.aws.af.cm";
}
else {
	url = "http://localhost:80";
}
socket = io.connect(url, {'transports': ['jsonp-polling']});

var 	playerLatency = new TimeSeries(),
		chart = new SmoothieChart();

chart.addTimeSeries(playerLatency, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 2 });
chart.streamTo(document.getElementById("chart"), 500);

var setEventHandlers = function() {
	console.log("Client connected");
	socket.emit("login", { username: username });
	socket.on("update", updateClient);
	socket.on("load", loadInstructions);
	socket.on("playerDisconnected", removeShip);
	socket.on("ping", function(data){
		if (player) {
			player.latency = data.latency;
		}
		playerLatency.append(new Date().getTime(), data.latency);
		$("#latency").html("<h3>&nbsp;&nbsp;Latency:  " + data.latency + "</h3>");
		socket.emit("pong", data);
	});
	return socket;
};

function updateClient(data) {
	if (data.instruction.name == "move") {
		if (data.instruction.details.username == socket.socket.sessionid) {
			moveShip(player, true, data.instruction);
			$("#cockpit #speed").html("<div>pX:&nbsp;"+player.position.x+"&nbsp;pY:&nbsp;"+player.position.y+"&nbsp;pZ:&nbsp;"+player.position.z+"&nbsp;rY:&nbsp;"+player.rotation.y+"</div>");
		}
		else {
			$("#cockpit #targets").html("");
			ships.forEach(function(ship,index){
				if (data.instruction.details.username == ship.username) {
					moveShip(ships[index], false, data.instruction);
					$("#cockpit #targets").append("<div><strong>"+ship.username+"&nbsp;&nbsp;</strong>pX:&nbsp;"+ship.position.x+"&nbsp;pY:&nbsp;"+ship.position.y+"&nbsp;pZ:&nbsp;"+ship.position.z+"&nbsp;rY:&nbsp;"+ship.rotation.y+"</div>");
				}
			});
		}
	}
}

function removeShip(data) {
	ships.forEach(function(ship, index){
		if (ship.username == data.username) {
			
			scene.remove(ships[index]);
			ships.splice(index, 1);
		}
	});

}