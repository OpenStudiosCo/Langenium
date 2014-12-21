/*
	Director
*/

var director = function() {

	this.options = {
		activeScene: 'Character Test',
		currentScene: '',
		hideInterface: true,
		editMode: false,
		paused: false,
		scenes: [
			'Epoch Exordium',
			'MMO',
			'MMO Title',
			'Character Test',
			'Porta',
			'Sandbox',
		],
		useControls: true
	};

	L.scenograph.updateWindowVariables();
	
	return this;
}

director.prototype._init = function() {
	window.L.director = new director();
}

