var mmo_title = function() {
	L.scenograph.camera_state.zoom = 4500;
	L.scenograph.camera.position.set(
		0, 
		0,
		L.scenograph.camera_state.zoom
	);	

	var logoWaterMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: L.scenograph.effects.logo_water_uniforms,
		vertexShader:   document.getElementById( 'logoWaterVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'logoWaterFragShader' ).textContent,
		side: THREE.DoubleSide
	}   );

	var logoMetalMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: L.scenograph.effects.logo_metal_uniforms,
		vertexShader:   document.getElementById( 'logoMetalVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'logoMetalFragShader' ).textContent,
		side: THREE.DoubleSide
	}   );

	var logo_cb = function(geometry, materials) {
		
		for (var i = 0; i < materials.length; i++) {
			if(materials[i].name == 'Water') {
				materials[i] = logoWaterMaterial;
			}
			if (materials[i].name == 'Metal') {
				materials[i] = logoMetalMaterial;
			}
		}
		geometry.buffersNeedUpdate = true;
		geometry.uvsNeedUpdate = true;
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		mesh.scale.set(2000,2000,2000);
		mesh.rotateX( Math.PI / 2 );
		L.scenograph.scene.add(mesh);			
	}
	
	L.scenograph.objects.loadObject('/res/models/langenium-logo.js', logo_cb);

	return this;
}

mmo_title.prototype._init = function() {
	L.scenograph.mmo_title = new mmo_title();
}