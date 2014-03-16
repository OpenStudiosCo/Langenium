/*

	Creates the libs container for the application

*/

module.exports = function() {
	var libs = {
		// 3rd party libs
		connect: require('connect'),
		express: require('express'),
		passport : require('passport'),
		fbsdk: require('facebook-sdk'),
		mongoose: require('mongoose'),
		path: require('path'),
		fs: require('fs'),
		os: require('os'),
		stylus: require('stylus'),
		jeet: require('jeet')
	};
	// Activates interdependencies and start up stuff
	libs.mongoose.connect('127.0.0.1:27017/langenium', {
		user: process.env['DB_USERNAME'],
		pass: process.env['DB_PASSWORD']
	});

	libs.fb = new libs.fbsdk.Facebook({ appId: process.env['APP_ID'], secret: process.env['APP_SECRET'] });

	libs.io = require('socket.io').listen(parseInt(process.env['IO_PORT']));
	libs.io.set('log level', 2);

	// This should go into some kind of utility class... it applies to both admin and game.. maybe website? 

	libs.io.on('connection', function(socket) {
		socket.emit('ping', { time: new Date().getTime(), latency: 0 });
		socket.on('pong', function (data) { 
			return function(socket, data) {
				var time = new Date().getTime(); 
				var latency = time - data.time;
				socket.emit("ping", { time: new Date().getTime(), latency: latency });
			}(socket, data) });
	});
	
	return libs;
};