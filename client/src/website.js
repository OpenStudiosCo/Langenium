/*
	website.js
*/

var l = function () {
	$('.slideshow').cycle({
		slides: '> .slide',
		log: false
	});		
	console.log('[ Website started ]');
};

window.l = l;

l.prototype._init = function() {
	window.l = new l();
	delete l._init;
}

