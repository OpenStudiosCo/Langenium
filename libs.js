/*

	Creates the libs container for the application

*/

module.exports = function() {
	var libs = {
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
		passport: require('passport'),
		FacebookStrategy: require('passport-facebook').Strategy,
		fbsdk: require('facebook-node-sdk'),
		mongoose: require('mongoose'),
		path: require('path'),
		fs: require('fs'),
		os: require('os'),
		stylus: require('stylus'),
		jeet: require('jeet')
	};

	libs.fb = new libs.fbsdk({ appId: process.env['APP_ID'], secret: process.env['APP_SECRET'] });

	libs.mongoose.connect('127.0.0.1:27017/langenium', {
		user: process.env['DB_USERNAME'],
		pass: process.env['DB_PASSWORD']
	});
	
	return libs;
};