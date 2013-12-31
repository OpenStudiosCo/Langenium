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

		var texture = new THREE.Texture( canvas, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter );
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


procedural.prototype.building = function() {
	var texture_image = document.createElement("canvas");
	var height = 1024;
	var width = 1024;

	texture_image.height = height;
	texture_image.width = width;

	var simplex = new SimplexNoise();

	var context = texture_image.getContext('2d');
	// Create the yellow face
	var twopi = Math.PI * 2;
	// instantiate golden ratio constant
    var PHI = (1+ Math.sqrt(5))/2;
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

			if ((y%grid_height <= grid_border * 4|| x%grid_width <= grid_border) ) {
				
				n = simplex.noise(x, y);
				newval =  99 * PHI * n + 11 * Math.sin( n * twopi);
				
				red = newval;
				green =  newval;
				blue = newval;
				
			}
			else {
				n += Math.tan(x ^ 2 * y ^ 2);
				n += Math.sin(x ^ 2 * y ^ 2);
				newval = 95 - n;
				red = newval;
				green =  55 + newval;
				blue = 95 + newval;
			}
			red = Math.floor(red);
			green = Math.floor(green);
			blue = Math.floor(blue );
			textures.procedural.setPixel(imageData, x, y, red, green, blue, 255);

			
		}
	}
	context.putImageData(imageData, 0,0);




	return texture_image;


}