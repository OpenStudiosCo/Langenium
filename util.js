/*

	Utility functions that don't really have a place and can be called from anywhere

*/

module.exports = function(app) {
	var util = {
		import_classes: function(module_obj, path) {
			app.libs.fs.readdirSync(path).forEach(function (file) {
				var filename = file.replace('.js','');
				if(file.substr(-3) == '.js') {
					module_obj[filename] = require(path + '/' + file)(app.libs);
				}
			});
		},
		render: function(req, res, template, variables) {
			res.setHeader("Expires", "-1");
			res.setHeader("Cache-Control", "must-revalidate, private");
			if ((req.user)&&(req.user.username == 'TheZeski')) { // this is hopefully overkill as FB is in sandbox_mode :D
				variables.logged_in = true;
				variables.user = { username: req.user.username, profile_img: 'https://graph.facebook.com/'+req.user.facebook_id+'/picture?width=20&height=20' };
			}
			else {
				variables.logged_in = false;	
			}
			res.render(template, variables);
		},
		add_clock: function(obj, callback) {
			obj.clock = setInterval( function(){ callback(obj); }, 1000 / 66);
		}
	};
	return util;
};