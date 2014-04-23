var L = function() {
	var L = {
		name: "Langenium client application",
		gui: new dat.GUI(),
		socket: io.connect(window.location.hostname)
	};

	console.log("Client application has started")
	return L;
};

window.L = L();