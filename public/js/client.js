(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
	var app = {
		name : "Langenium Client"
	};
	app.Ember = Ember.Application.create();

	console.log("Client ready")
	return app;
}


},{}],2:[function(require,module,exports){
(function (global){
// Initialize the Langenium client

global.L = require('./app')()

L.Ember.Router.map(function(){
	this.route('about', { 
		path: '/about'
	});
});

L.Ember.IndexRoute = Ember.Route.extend({
	model: function() {
		return ['red', 'yellow', 'blue'];
	}
});

L.Ember.AboutRoute = Ember.Route.extend({
	model: function() {
		return ['severe', 'green', 'purple', 'severe'];
	}
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./app":1}]},{},[2])