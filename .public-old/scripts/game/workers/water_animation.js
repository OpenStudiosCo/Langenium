  /*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Water animation
	This class defines the water animation
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
var curr_time;

self.addEventListener('message', function(e){
	switch(e.data.req) {
		case 'begin':
			begin(e.data.water_tiles);
			break;
	}

});

function begin(water_tile_array) {
	setTimeout(function(){
		for (var i = 0; i < 111; i++) {
			curr_time = new Date().getMilliseconds() * 10;
			animate(i);
		};
	}, 1000 / 66);
}

function animate(i) {
	postMessage({
		i: i,
		z: 5.654321 * Math.sin( i / 5 + ( curr_time + i ) /  7),
		y: 222.654321 * Math.sin( i / 5 + ( curr_time + i ) /  7)
	});
}
