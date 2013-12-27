/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Clouds
	This defines methods for cloud effects
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
var noiseTexture = THREE.ImageUtils.loadTexture( "/assets/shared/textures/noise2.jpg" );
noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

var clouds = function() {
	this.collection = [];

	this.uniforms = {
		noiseTexture:	{ type: "t", value: noiseTexture },
		scale: 			{ type: "f", value: 0.000001 },
		time: 			{ type: "f", value: 0.0 }
	};
	
	return this;
};

clouds.prototype.make = function (position) {
    var material = new THREE.ShaderMaterial( {
		uniforms: effects.clouds.uniforms,
		vertexShader:   document.getElementById( 'cloud_vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'cloud_fragmentShader' ).textContent

	} );
	var cloud = new THREE.Mesh(new THREE.SphereGeometry(150, 10, 30), material);
	cloud.scale.set(2000, 2000, 2000);
	//cloud.scale.set(2450, 2450, 2450);
	cloud.material.side = THREE.BackSide ;
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

