/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Textures
	This defines texture drawing methods 
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

var textures = function() {
	this.materials = [
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
	];
	
	this.procedural = new procedural();
	this.sprites = new sprites();

    return this;
};

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

textures.prototype.prepare = function(geometry, materials, useVertexOverrides) {
	materials.forEach(function(material, material_index){
		textures.materials.forEach(function(material_details){
			if (material_details.name == material.name) {
				if (material_details.vertex && material_details.vertex == true) {
					materials[material_index].vertexColors = THREE.VertexColors;
					materials[material_index].side = THREE.DoubleSide;
				}
				if (material_details.opacity) {
					materials[material_index].transparent = true;
					materials[material_index].opacity = material_details.opacity;
				}
			}
		});
	});

	if (useVertexOverrides == true) {
		geometry.faces.forEach(function(face,index) {
			textures.materials.forEach(function(material_details){
				console.log()
				if (materials[face.materialIndex].name == material_details.name && material_details.colours) {
						if (index % 2 == 0) {
							face.vertexColors[0] = material_details.colours[0];
							face.vertexColors[1] = material_details.colours[1];
							face.vertexColors[2] = material_details.colours[2];
						}
						else {
							face.vertexColors[0] = material_details.colours[1];
							face.vertexColors[1] = material_details.colours[2];
							face.vertexColors[2] = material_details.colours[0];
						}
				}
			});
		});
	}	

};