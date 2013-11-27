$(document).ready(function () {
	$('#slideshow').append('<ul class="controls"></ul>');

	$('#slideshow .slides').cycle({
		fx: 'fade',
		delay: 2000,
		pager: '#controls'
	});


});
$(window).load(function () {
	// load Youtube Player API
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/player_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	var player;
 });

function onYouTubePlayerAPIReady() {
	$('.video').each(function () {
		var id = $(this).attr('href').replace('http://www.youtube.com/watch?v=', '');
		$(this).parent().append('<div id="' + id + '"></div>');
		player = new YT.Player(id, {
			height: '315',
			width: '420',
			videoId: id
		});
		player.addEventListener("onStateChange", pauseSlideshow);
		$(this).remove();
	});
}
function pauseSlideshow(event) {
	if ((event.data > 0) && (event.data != 2))  {
		$('#slideshow .slides').cycle('pause');
	}
	else if ((event.data == '0') || (event.data == '2')) {
		$('#slideshow .slides').cycle('resume');
	}
	
}
