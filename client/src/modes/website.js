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
		
	L.director.options.activeScene = "Epoch Exordium";
	L.scenograph.animate();

	console.log('[ Website started ]');

	return this;
};

app.prototype._init = function() {
	L.app = new app();
}
