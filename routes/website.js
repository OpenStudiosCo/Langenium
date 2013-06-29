/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	Database
	This class contains functions to interact with the database
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var https = require('https'),
	db,
	fb;


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Pages
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

exports.index = function(req, res) {
	render(req, res, 'website/index', { page: 'pages/home' });
};

exports.about = function(req, res) {
	render(req, res, 'website/index', { page: 'pages/about', variable: "Some text" });
};

exports.gallery_list = function(req, res) {
	gallery_albums(req, res);
};
exports.gallery = function(req, res) {
	gallery_view(req, res);
};

exports.guide = function (req, res)
{

	var search_query = req.params[0] ? req.params[0] : '';
	var reserved = ['index', 'Index', 'New', 'new'];
	var reserved_page = false;

	for (var i = 0; i < reserved.length; i++) {
		if (reserved[i] == search_query) {
			reserved_page = true;
		}
	}
	if (reserved_page == false) {
		var pages = [];
		var template = 'pages/guide';
		if (search_query.indexOf('edit') >= 0) {
			template = 'pages/guide_edit';
			if (search_query != 'edit') {
				search_query = search_query.replace('/edit','');
			}
			else {
				search_query = search_query.replace('edit','');
			}
		}
		
		if (search_query.length == 0) {
			search_query = "Game Guide"; 
		}
		else {
			pages.push({name: 'Game Guide', url: '/guide/'});
		}

		var processResult = function (result)
		{
			if (result.length == 0)
			{
				console.log(search_query);
			}
			else
			{
				pages.push({name: search_query, url: '/guide/' + search_query});
				if (search_query.indexOf('edit') >= 0) {
					pages.push({name: 'Edit', url: '#'});
				}
				var breadcrumb_trail = makeBreadcrumbs(pages);
				render(req, res, 'website/index', 
					{ 
						page: template, 
						content: result[0],
						breadcrumbs: breadcrumb_trail,
						edit_url: '/guide/' + search_query + '/edit'
					}
				);
			}
		};

		db.queryWebsiteDB("guide", { Title: search_query }, processResult);
	}
	else {
		if ((search_query == 'new')||(search_query == 'New')) {
			guide_new(req, res);
		}
		if ((search_query == 'index')||(search_query == 'Index')) {
			guide_index(req, res);
		}
	}
};

var guide_new = function(req, res) {
	var pages = [];

	pages.push({name: 'New', url: '/guide/new'});
	var breadcrumb_trail = makeBreadcrumbs(pages);
	render(req, res, 'website/index', 
		{ 
			page: 'pages/guide_new', 
			breadcrumbs: breadcrumb_trail
		}
	);
		
};

var guide_index = function(req, res) {
	var pages = [];
	var processResult = function (result)
	{
		if (result.length == 0) { console.log('Failed to get list of guide articles'); } 
		else {
			pages.push({name: 'Index', url: 'Index'});
			var breadcrumb_trail = makeBreadcrumbs(pages);
			render(req, res, 'website/index', 
				{ 
					page: 'pages/guide_index', 
					content: result,
					breadcrumbs: breadcrumb_trail
				}
			);
		}
	};
	db.queryWebsiteDB("guide", null, processResult);
};

exports.guide_save = function(req, res) {
	db.saveGuide(req.body.newtitle, req.body.newtitle, req.body.content);
	res.writeHead(302, { 'Location': '/guide/'+req.body.newtitle  });
	res.end();
};
exports.community = function(req, res) {
	render(req, res, 'website/index', { page: 'pages/community' });
};

exports.redirect = function(req, res) {
	res.writeHead(302, { 'Location': 'http://langenium.com/'  });
	res.end();
};

var render = function(req, res, template, variables) {
	res.setHeader("Expires", "-1");
	res.setHeader("Cache-Control", "must-revalidate, private");
	if ((req.user)&&(req.user.username == 'TheZeski')) { // this is hopefully overkill as FB is in sandbox_mode :D
		variables.logged_id = true;
		variables.user = { username: req.user.username, profile_img: 'https://graph.facebook.com/'+req.user.facebook_id+'/picture?width=20&height=20' };
	}
	else {
		variables.logged_id = false;	
	}
	res.render(template, variables);
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Special
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

exports.setProviders = function (database, facebook) {
	db = database;
	fb = facebook;
}

exports.news = function (req, res) {
	//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
	var options = {
		hostname: 'www.facebook.com',
		port: 443,
		path: '/feeds/page.php?id=440581949340306&format=json',
		method: 'GET',
		headers: {
			'user-agent': 'Mozilla/5.0',
			'Content-Type': 'application/json'
		}
	};
	var feed = '';
	var getFeed = https.request(options, function (https_res) {
		https_res.on('data', function (d) {
			feed += d;
		});
		https_res.on('end', function () {
			feed = JSON.parse(feed);
			res.setHeader('Content-Type', 'application/json');
			res.send(feed);
		});
	});
	getFeed.end();
}

var gallery_albums = function (req, res) {
	var pages = [{name: 'Gallery', url: '/gallery/' }];
	var breadcrumb_trail = makeBreadcrumbs(pages);
	fb.api('/Langenium/albums/', function(data){
		var albums = [];
		for (var i = 0; i < data.data.length; i++) {
			var album = {};
			album.id = data.data[i].id;
			album.name = data.data[i].name;
			album.url = '/gallery/' + album.name + '/' + album.id;
			album.photo_url = 'http://graph.facebook.com/' + data.data[i].cover_photo + '/picture?type=album';
			albums.push(album);

		}

		render(req, res, 'website/index', 
			{ 
				page: 'pages/gallery_list', 
				gallery_list: albums, 
				breadcrumbs: breadcrumb_trail
			}
		); 
	});
}

var gallery_view = function (req, res) {
	var url_params = req.params[0].split('/');
	switch(url_params.length) {
		case 2: // +/gallery/album_name/album_id
			var pages = [
				{ name: 'Gallery', url: '/gallery/' },
				{ name: url_params[0], url: '/gallery/' + url_params[0] + '/' + url_params[1] }
			];
			var breadcrumb_trail = makeBreadcrumbs(pages);
			fb.api('/' + url_params[1] + '/photos/', function(data){
				var photos = [];
				for (var i = 0; i < data.data.length; i++) {
					var photo = {};
					photo.id = data.data[i].id;
					photo.name = data.data[i].name;
					photo.url = '/gallery/' + url_params[0] + '/' + url_params[1] + '/view/' + photo.id;
					photo.photo_url = data.data[i].images[data.data[i].images.length - 1].source;
					photos.push(photo);

				}

				render(req, res, 'website/index', 
					{ 
						page: 'pages/gallery_list', 
						gallery_list: photos,
						breadcrumbs: breadcrumb_trail
					}
				); 
			});
			break;
		case 4: // +/gallery/album_name/view/photo_id
			var pages = [
				{ name: 'Gallery', url: '/gallery/' },
				{ name: url_params[0], url: '/gallery/' + url_params[0] + '/' + url_params[1] },
				{ name: 'Viewing image', url: '#' },
			];
			var breadcrumb_trail = makeBreadcrumbs(pages);
			fb.api('/' + url_params[3], function(data){

				var photo = {};
				photo.id = data.id;
				photo.name = data.name;
				photo.url = data.link;
				photo.photo_url = data.images[1].source;

				render(req, res, 'website/index', 
					{ 
						page: 'pages/gallery_view', 
						gallery: photo,
						breadcrumbs: breadcrumb_trail
					}
				); 
			});
			break;
	}
	

}

function makeBreadcrumbs (pages) {
	var breadcrumbs = [];
	for (var i = 0; i < pages.length; i++) {
		var breadcrumb = {};
		breadcrumb.name = pages[i].name;
		breadcrumb.url = pages[i].url;
		breadcrumbs.push(breadcrumb);
	}
	return breadcrumbs;
}