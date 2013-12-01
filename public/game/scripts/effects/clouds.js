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

	this.uniforms = {
		time: 			{ type: "f", value: 0.0 },
		scale: 			{ type: "f", value: .00015337 }
	};
	
	return this;
};

clouds.prototype.make = function (position) {
    var material = new THREE.ShaderMaterial( {
		uniforms: effects.clouds.uniforms,
		vertexShader:   document.getElementById( 'cloud_vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'cloud_fragmentShader' ).textContent

	} );
	var cloud = new THREE.Mesh(new THREE.SphereGeometry(150, 100, 100), material);

	cloud.position.x = position.x;
	cloud.position.y = position.y;
	cloud.position.z = position.z;
	effects.clouds.collection.push(cloud);
	engine.scene.add(effects.clouds.collection[effects.clouds.collection.length-1]);
}

clouds.prototype.animate = function(delta) {
	effects.clouds.uniforms.time.value += delta;
}

