// Initialize the Langenium client

// Load and initialize the Ember application
global.L = require('./L')()

L.ember_app = require('./ember_app')()

L.scenograph = require('./scenograph')()

L.scenograph.director.init(L);
L.scenograph.director.animate(L);