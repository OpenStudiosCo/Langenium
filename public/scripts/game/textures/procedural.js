/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Textures
	This defines texture drawing methods 
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var procedural = function() {
	// object based cache as they'll use the keyname as an ID
	this.cache = {};
	return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

procedural.prototype.createMaterial = function(cache_name, texture_callback) {
	if (textures.procedural.cache[cache_name]){
		textures.procedural.cache[cache_name].needsUpdate = true;
		return textures.procedural.cache[cache_name];
	}
	else {
		var canvas = texture_callback();

		var texture = new THREE.Texture(  canvas);
		texture.anisotropy  = engine.renderer.getMaxAnisotropy();
		texture.needsUpdate = true;
		
		var material = new THREE.MeshLambertMaterial( { map: texture } );
		textures.procedural.cache[cache_name] = material;
		return material;
	}
}

procedural.prototype.setPixel = function(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}


procedural.prototype.building_windows = function() {
	// build a small canvas 32x64 and paint it in white
	var canvas  = document.createElement( 'canvas' );
	canvas.width = 64;
	canvas.height    = 64;
	var context = canvas.getContext( '2d' );
	// plain it in white
	context.fillStyle    = '#DEDEDE';
	context.fillRect( 0, 0, 64, 128 );
	// draw the window rows - with a small noise to simulate light variations in each room
	for( var y = 2; y < 64; y += 2 ){
	  for( var x = 0; x < 64; x += 2 ){
	      var value   = Math.floor( Math.random() * 64 );
	      context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
	      context.fillRect( x, y, 2, 1 );
	  }
	}

	// build a bigger canvas and copy the small one in it
	// This is a trick to upscale the texture without filtering
	var canvas2 = document.createElement( 'canvas' );
	canvas2.width    = 512;
	canvas2.height   = 1024;
	var context = canvas2.getContext( '2d' );
	// disable smoothing
	context.imageSmoothingEnabled        = false;
	context.webkitImageSmoothingEnabled  = false;
	context.mozImageSmoothingEnabled = false;
	// then draw the image
	context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
	// return the just built canvas2
	return canvas2;
}

procedural.prototype.building_roof = function() {
	var texture_image = document.createElement("canvas");
	var height = 1024;
	var width = 1024;

	texture_image.height = height;
	texture_image.width = width;

	var simplex = new SimplexNoise();

	var context = texture_image.getContext('2d');
	var imageData = context.createImageData(height, width);

	var 	red = 0, 
			green= 0, 
			blue= 0, 
			newval, 
			n,
			grid_width = 20,
			grid_height = 35,
			grid_border = 5;
	for (var x = 0; x < width; x++) {
		
		newval = 255;
		red = newval;
		green =  newval;
		blue = newval;
		for (var y = 0; y < height; y++) {

			n = simplex.noise(x, y);
			newval = 55 - n;
			red = newval;
			green =   newval;
			blue =  newval;
				
			red = Math.floor(red);
			green = Math.floor(green);
			blue = Math.floor(blue );
			textures.procedural.setPixel(imageData, x, y, red, green, blue, 255);
			
		}
	}
	context.putImageData(imageData, 0,0);

	return texture_image;
}