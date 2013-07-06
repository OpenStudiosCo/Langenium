/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Database
	This class contains functions to interact with the database
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Exports Functions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

module.exports.queryClientDB = queryClientDB;
module.exports.queryWebsiteDB = queryWebsiteDB;


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Global Variables
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var 		db_user = process.env['DB_USERNAME'],
			db_pass = process.env['DB_PASSWORD'],
			db_url = db_user+':'+db_pass+'@langenium.com:27017/',
			mongojs  = require("mongojs"),
			client_db = mongojs(db_url + 'dev_client'),
			website_db = mongojs(db_url + 'dev_website');


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function Definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

function queryClientDB(collection_name, search_term, callback) {
	var collection = client_db.collection(collection_name);
	if (Object.keys(search_term).length > 0) {
		collection.find(search_term).toArray(function(err, result) {
			if (err) { console.log(err); }
			else {
				callback(result);	
			}
		});
	}
	else {
		collection.find().toArray(function(err, result) {
			if (err) { console.log(err); }
			else {
				callback(result);	
			}
		});
	}
}

function queryWebsiteDB(collection_name, search_term, callback) {
	var collection = website_db.collection(collection_name);
	if (Object.keys(search_term).length > 0) {
		collection.find(search_term).toArray(function(err, result) {
			if (err) { console.log(err); }
			else {
				callback(result);	
			}
		});
	}
	else {
		collection.find().toArray(function(err, result) {
			if (err) { console.log(err); }
			else {
				callback(result);	
			}
		});
	}
}

exports.addUser = function(username, facebook_id) {
	var users = website_db.collection('users');
	users.save({
		username: username,
		facebook_id: facebook_id
	})
}
exports.saveGuide = function(newtitle, title, content) {
	
	var guide = website_db.collection('guide');
	guide.findAndModify({
		query: { Title: title }, 
		update : {$set:{Content:content, Title: newtitle}},
		'new': true,
		upsert: true
	},
		function(err, new_content) {
			if (err) {console.log(err);}
			console.log(new_content);
		}
	);
}

exports.saveObject = function(obj_details, callback, instances) {
	var instance_objects = client_db.collection('instance_objects');
	instance_objects.save(obj_details, function(err, obj){

		callback(obj._id);
		// Remove Existing
		if (obj_details._id) {
			instances.master.instances[0][obj_details.class].forEach(function(environment_object, index){
				if (environment_object._id.toString() == obj_details._id.toString()) {
					instances.master.instances[0][obj_details.class].splice(index, 1);
				}
			}); 
		}
		else {
			obj_details._id = obj._id;
		}
		instances.master.addObjectToContainer(obj_details, instances.master);		
		
	});

}

exports.deleteObject = function(obj_details, callback, instances) {
	var instance_objects = client_db.collection('instance_objects');
	instance_objects.remove({_id: obj_details._id}, function(err, obj){
		instances.master.instances[0][obj_details.class].forEach(function(environment_object, index){
			if (environment_object._id.toString() == obj_details._id.toString()) {
				instances.master.instances[0][obj_details.class].splice(index, 1);
			}
		}); 
		callback(obj_details._id);
	});
}



















