$(document).ready(function () {
	$.getJSON('/news', function (data) {
		$('#news ul li.loading').slideUp();
		data.entries.forEach(function (entry) {
			$('#news ul').append("<li></li>");
			$('#news li:last-child').append("<h3></h3>");
			$('#news li:last-child h3').html(entry.published)
			$('#news li:last-child').append(entry.content);
			$('#news li:last-child').slideDown();
		});
	});
});