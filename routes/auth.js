/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Auth
	This class contains handlers for authentication
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var FacebookStrategy = require('passport-facebook').Strategy;

exports.configure_passport = function (passport, db) {
	// Setup Facebook authentication
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});
	passport.use(new FacebookStrategy({
		clientID: process.env['APP_ID'],
		clientSecret: process.env['APP_SECRET'],
		callbackURL: "http://" + process.env['HOST_URL'] + "/auth/facebook/callback"
	  },
	  function(accessToken, refreshToken, profile, done) {
	  	
	  	var checkUserExists = function(result){
			if (result.length == 0) {
				db.addUser(profile._json.username, profile._json.id);
			}
	  	};
	 	var user = { 
	 		username: profile._json.username, 
	 		facebook_id: profile._json.id
	 	};
	  	db.queryWebsiteDB("users", { facebook_id: profile._json.id }, checkUserExists);
		return done(null, user);
	  }
	));
}