L.scenograph.objects = {
	loader: new THREE.JSONLoader(),
	loadObject: function(url, callback) {
		this.loader.load(url, function(geometry, materials) {
			// This a mishmash of the old object and texture classes 
			for (var i = 0; i < materials.length; i++) {
				for (var j = 0; j < L.scenograph.objects.materials.length; j++) {
					if (L.scenograph.objects.materials[j].name == materials[i].name) {
						if (L.scenograph.objects.materials[j].vertex && L.scenograph.objects.materials[j].vertex == true) {
							materials[i].vertexColors = THREE.VertexColors;
							materials[i].side = THREE.DoubleSide;
						}
						if (L.scenograph.objects.materials[j].opacity) {
							materials[i].transparent = true;
							materials[i].opacity = L.scenograph.objects.materials[j].opacity;
						}
					}
				}
			}
			for (var i = 0; i < geometry.faces.length; i++) {
				for (var j = 0; j < L.scenograph.objects.materials.length; j++) {
					if (materials[geometry.faces[i].materialIndex].name == L.scenograph.objects.materials[j].name && L.scenograph.objects.materials[j].colours) {
						geometry.faces[i].vertexColors[0] = L.scenograph.objects.materials[j].colours[0];
						geometry.faces[i].vertexColors[1] = L.scenograph.objects.materials[j].colours[1];
						geometry.faces[i].vertexColors[2] = L.scenograph.objects.materials[j].colours[2];
					}
				}
			}
			callback(geometry, materials);
		});
	},
	materials: [
		// Metals
		{	
			name: "Light-Metal",
			vertex: true,
			colours: [
				new THREE.Color( 0x666666 ),
				new THREE.Color( 0x444444 ),
				new THREE.Color( 0x666666 ),
				new THREE.Color( 0x666666 )]	},
		{	
			name: "Steel",
			vertex: true	},
		{	
			name: "Metal",
			vertex: true,
			colours: [
				new THREE.Color( 0x333333 ),
				new THREE.Color( 0x222222 ),
				new THREE.Color( 0x333333),
				new THREE.Color( 0x333333 )]	},
		{	
			name: "Red-Metal",
			vertex: true,
			colours: [
				new THREE.Color( 0x440000 ),
				new THREE.Color( 0x440000 ),
				new THREE.Color( 0x550000 ),
				new THREE.Color( 0x440000 )]	},
		// Glass
		{
			name: "Glass",
			vertex: true,
			opacity: 0.8	},
		{
			name: "Dark-Glass",
			vertex: true,
			opacity: 0.1,
			colours: [
				new THREE.Color( 0x001122 ),
				new THREE.Color( 0x112233 ),
				new THREE.Color( 0x112244 ),
				new THREE.Color( 0x112233 )]	}
	]
};