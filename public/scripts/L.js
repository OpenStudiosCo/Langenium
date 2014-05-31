var L = function() {
	// override default behaviour
	dat.GUI.autoPlace = false;
	var L = {
		name: "Langenium client application",
		gui: new dat.GUI(),
		socket: io.connect(window.location.hostname + ':443')
	};
	L.gui.name = "Engine";
	L.gui.domElement.style.position = 'absolute';
	L.gui.domElement.style.top = '0px';
	L.gui.domElement.style.right = '20px';
	L.gui.domElement.style.paddingBottom = '22px';

	console.log("Client application has started")
	return L;
};

window.L = L();