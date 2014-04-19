// Initialize the Langenium client

// Load and initialize the Ember application
global.L = require('./L')()

L.ember_app = require('./ember_app')()
// For now these entities are just flat files with Models and Controllers and Fixtures - OH MY!
require('./ember_app/blog')(L.ember_app);
require('./ember_app/index')(L.ember_app);
require('./ember_app/games')(L.ember_app);

L.scenograph = require('./scenograph')()

L.scenograph.director.init(L);
L.scenograph.director.animate(L);

L.socket = io.connect(window.location.hostname);
L.socket.emit('pong', { time: new Date().getTime()});
L.socket.on('ping', function(data){
	$('#latency .latency').html(data.latency);
	L.socket.emit('pong', { time: new Date().getTime()});
});

