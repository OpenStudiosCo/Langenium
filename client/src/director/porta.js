/*

	Porta (Gate)

	This is a parser for light patterns and twisting them with euclidean functions

	First version is focused on interpreting Chinese Zodiac signs into light patterns

	Will then extent this into the Sephiroth work to create a 3D map of light that can be traversed. 

	Also need to look at how to raytrace 2D images and reproject them in 3D using rotations along the map I design above. 

	Implementing via vertex/fragment shader

*/

var porta = function() {

	L.scenograph.camera_state.zoom = 35;
	L.scenograph.camera.position.set(
		0, 
		100,
		L.scenograph.camera_state.zoom
	);	

	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
	hemiLight.name = "light1";
	hemiLight.color.setRGB( 0.9, 0.95, 1 );
	hemiLight.groundColor.setRGB( 0.6, 0.75, 1 );
	hemiLight.position.set( 0, 100, 0 );
	L.scenograph.scene.add(hemiLight);

	var material = new THREE.ShaderMaterial( 
	{
	    uniforms: L.scenograph.effects.porta_uniforms,
		vertexShader:   document.getElementById( 'portaVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'portaFragShader' ).textContent,
		side: THREE.DoubleSide
	}   );


	var mesh = new THREE.Mesh(new THREE.SphereGeometry(32, 32, 32), material);
	L.scenograph.scene.add(mesh);

	var animation_obj = {
		animate: function(delta) {
			L.scenograph.effects.porta_uniforms.time.value += delta * 0.0001;
		}
	}
	
	L.scenograph.animation_queue.push(animation_obj)


	return this;
};


porta.prototype._init = function() {
	L.director.porta = new porta();
}
