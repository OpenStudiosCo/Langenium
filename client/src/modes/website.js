/*
	website.js
*/

var app = function () {
	$('.slideshow').cycle({
		slides: '> .slide',
		log: false
	});		
	$('.ui.dropdown')
      .dropdown({
        on: 'hover'
      })
    ;
		
	console.log('[ Website started ]');

	return this;
};

app.prototype._init = function() {
	L.app = new app();
}

app.prototype._destroy = function() {
	$('.slideshow').cycle("destroy");
}