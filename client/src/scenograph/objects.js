var objects = function () {

	this.loader = new THREE.JSONLoader();

	this.loadObject = function(url, callback) {
		this.loader.load(url, function(geometry, materials) {
		
			callback(geometry, materials);
		});
	};

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
	return this;
};

objects.prototype._init = function() {
	L.scenograph.objects = new objects();
}