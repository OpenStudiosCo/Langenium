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

	var noiseTexture = THREE.ImageUtils.loadTexture( "/game/assets/textures/noise2.png" );
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 

	this.uniforms = {
		time: 			{ type: "f", value: 0.0 },
		noiseTexture:   { type: "t", value: noiseTexture },
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
	var cloud = new THREE.Mesh(new THREE.SphereGeometry(150, 30, 30), material);
	cloud.scale.set(5, 5, 5);
	cloud.material.side = THREE.DoubleSide;
	cloud.material.opacity = 0.15;
	cloud.material.transparent = true;
	cloud.position.x = position.x;
	cloud.position.y = position.y;
	cloud.position.z = position.z;
	effects.clouds.collection.push(cloud);
	engine.scene.add(effects.clouds.collection[effects.clouds.collection.length-1]);
}

clouds.prototype.animate = function(delta) {
	effects.clouds.uniforms.time.value += delta;
}

