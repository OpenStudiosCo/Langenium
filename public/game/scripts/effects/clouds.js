/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Clouds
	This defines methods for cloud effects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var clouds = function() {
	this.collection = [];
	
	return this;
};

clouds.prototype.make = function (position) {
	var uniforms = {};
    var material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader:   document.getElementById( 'cloud_vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'cloud_fragmentShader' ).textContent

	} );
	var cloud = new THREE.Mesh(new THREE.SphereGeometry(150, 100, 100), material);
	cloud.scale = 1000;
	cloud.position.x = position.x;
	cloud.position.y = position.y;
	cloud.position.z = position.z;
	effects.clouds.collection.push(cloud);
	scene.add(effects.clouds.collection[effects.clouds.collection.length-1]);
}