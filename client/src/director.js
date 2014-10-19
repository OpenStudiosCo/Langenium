/*
	Director
*/

var director = function() {

	this.options = {
		activeScene: 'MMO',
		currentScene: '',
		hideInterface: true,
		editMode: false,
		scenes: [
			'Epoch Exordium',
			'MMO',
			'MMO Title',
			'Character Test',
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

