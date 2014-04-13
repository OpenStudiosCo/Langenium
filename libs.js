/*

	Creates the libs container for the application

*/

module.exports = function() {
	var libs = {
		// 3rd party libs
		express: require('express'),
		middleware: {
			compression: require('compression'),
			bodyParser: require('body-parser'),
			cookieParser: require('cookie-parser'),
			session: require('express-session'),
			logger: require('morgan'),
			favicon: require('static-favicon'),
			methodOverride: require('method-override')
		},
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

	
	return libs;
};