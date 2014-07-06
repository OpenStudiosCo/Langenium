L.content = {

};

L.content.loadPage = function(page) {
	$('#page').addClass('fadeOutUp');
	$('#page').removeClass('fadeInDown');
	if (page == '#/' || page == '') {
		page = 'home';
	} 
	else {
		page = page.replace('#/','');
	}

	var params = page.split('/');
	
	$('#page.fadeOutUp').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
		$('#viewport .slideshow').cycle('destroy');
		if (params.length > 1) {
			L.socket.emit('content',params)
		}
		else {
			$('#page').html($('#pages #' + page).html());
			$('#viewport .slideshow').cycle({
				slides: '> .slide'
			});		
			$('#page').addClass('fadeInDown');
			$('#page').removeClass('fadeOutUp');
		}
	});		

}
	
