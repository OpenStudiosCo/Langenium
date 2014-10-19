/*
	New Scenograph
	Once this is working, change the class name to lowercase
*/

var scenograph = function() {

	this.keyboard = new THREEx.KeyboardState();
	this.winW = 1024;
	this.winH = 768;
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
	this.updateWindowVariables = function(){
		if (document.body && document.body.offsetWidth) {
			this.winW = document.body.offsetWidth;
			this.winH = document.body.offsetHeight;
		}
		if (document.compatMode=='CSS1Compat' &&
			document.documentElement &&
			document.documentElement.offsetWidth ) {
			this.winW = document.documentElement.offsetWidth;
			this.winH = document.documentElement.offsetHeight;
		} 
		if (window.innerWidth && window.innerHeight) {
			this.winW = window.innerWidth;
			this.winH = window.innerHeight;
		}
	};
	return this;

}

scenograph.prototype._init = function() {
	L.scenograph = new scenograph();
}


