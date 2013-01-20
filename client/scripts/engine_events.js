var url = window.location.href;
if (url.indexOf("langenium") > 0)
{
	url = "http://54.252.102.111";
	//url = "langenium.ap01.aws.af.cm";
}
else {
	url = "http://localhost:80";
}
socket = io.connect(url);

var 	playerLatency = new TimeSeries(),
		chart = new SmoothieChart();

chart.addTimeSeries(playerLatency, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 1 });
chart.streamTo(document.getElementById("latencyBox"), 500);

var setEventHandlers = function() {
	console.log("Client connected");
	socket.emit("login", { username: username });
	socket.on("update", function(data) {
		data.forEach(function(updateData, index) {
			updateClient(updateData);
		});
	});
	socket.on("load", loadInstructions);
	socket.on("playerDisconnected", removeShip);
	socket.on("ping", function(data){
		if (player) {
			player.latency = data.latency;
		}
		playerLatency.append(new Date().getTime(), data.latency);
		$("#latencyLabel").html("<h3>&nbsp;" + data.latency + "ms</h3>");
		socket.emit("pong", data);
	});
	return socket; 
};

function updateClient(data) {
	if (data.instruction.name == "kill") {
		if (data.instruction.type == "bot") {
			bots.forEach(function(bot, index){
				if (bot.id == data.instruction.id) {
					teleportEffect(bot.position);
					scene.remove(bot);
					bots.splice(index, 1);
				}
			});
		}
		
	}

	if (data.instruction.name == "move") {
		if (data.instruction.details.username == socket.socket.sessionid) {
			if (player) {
				if (data.instruction.details.fire == 1) {
						addBullet(player); 
				}
				moveShip(player, true, data.instruction);
				$("#selectedItem").html("<div><strong>Player</strong><br />pX:&nbsp;"+player.position.x+"<br />pY:&nbsp;"+player.position.y+"<br />pZ:&nbsp;"+player.position.z+"<br />rY:&nbsp;"+player.rotation.y+"</div>");
			}
		}
		else {
			ships.forEach(function(ship,index){
				if (data.instruction.details.username == ship.username) {
					if (data.instruction.details.fire == 1) {
						addBullet(ships[index]); 
					}
					moveShip(ships[index], false, data.instruction);
				}
			});
			bots.forEach(function(bot,index){
				if (data.instruction.details.id == bot.id) {
					if (data.instruction.details.fire == 1) {
						addBullet(bots[index]); 
					}
					moveShip(bots[index], false, data.instruction);
				}
			});
		}
	}
}

function removeShip(data) {
	$("#playerList").html("");
	ships.forEach(function(ship, index){
		if (ship.username == data.username) {
			scene.remove(ships[index]);
			ships.splice(index, 1);
		}
		else {
			$("#playerList").append("<li>" + ship.username + "</li>");
		}
	});
	$("#players h2").html("Players online (" + ships.length + ")");
}