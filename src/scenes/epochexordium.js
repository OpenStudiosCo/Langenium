var epochexordium = function() {
	
	L.scenograph.camera_state.zoom = 7500;
	L.scenograph.camera.position.set(
		L.scenograph.camera_state.zoom * Math.cos(0), 
		L.scenograph.camera_state.zoom,
		L.scenograph.camera_state.zoom * Math.sin(0))			
	L.scenograph.camera.lookAt(new THREE.Vector3(0,0,0))
	var light = new THREE.PointLight(0xffffff, 1, 0);
	light.position.set(0,0,0);
	L.scenograph.scene.add(light);

	var geometry = new THREE.BoxGeometry( 1000000, 1000000, 1000000 );

	var texture_prefix = '/res/textures/epoch-exordium_'
	var textures = [
		texture_prefix + 'right1.png',
		texture_prefix + 'left2.png',
		texture_prefix + 'top3.png',
		texture_prefix + 'bottom4.png',
		texture_prefix + 'front5.png',
		texture_prefix + 'back6.png'
	];

	var textureCube = THREE.ImageUtils.loadTextureCube( textures );
	textureCube.format = THREE.RGBFormat;

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;

	var material = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	} );

	mesh = new THREE.Mesh( geometry, material );
	mesh.name = 'Space Box';
	L.scenograph.scene.add( mesh );

	// Using AU (Astronomical Unit x 1000 + 1000 for sun's size) for distance, proportion to Earth for others

	var scene_setup = {
		background: 'milkyway', // skybox
		objects: [
			{
				name: 'Sun',
				type: 'sun',
				radius: 1000, // units are AU
				position: {
					x: 0,	y: 0,	z: 0
				}
			},
			{
				name: 'Mercury',
				type: 'planet',
				radius: 3.82, // units are AU
				position: {
					x: 0,	y: 0,	z: 1387
				}
			},
			{
				name: 'Venus',
				type: 'planet',
				radius: 9.49, // units are AU
				position: {
					x: 0,	y: 0,	z: 1723
				}
			},
			{
				name: 'Earth',
				type: 'planet',
				radius: 10, // units are AU
				position: {
					x: 0,	y: 0,	z: 2000
				}
			},
			{
				name: 'Mars',
				type: 'planet',
				radius: 5.32, // units are AU
				position: {
					x: 0,	y: 0,	z: 2524
				}
			},
			{
				name: 'Jupiter',
				type: 'planet',
				radius: 111.9, // units are AU
				position: {
					x: 0,	y: 0,	z: 6203
				}
			},
			{
				name: 'Saturn',
				type: 'planet',
				radius: 92.6, // units are AU
				position: {
					x: 0,	y: 0,	z: 10529
				}
			},
			{
				name: 'Uranus',
				type: 'planet',
				radius: 40.1, // units are AU
				position: {
					x: 0,	y: 0,	z: 20190
				}
			},
			{
				name: 'Neptune',
				type: 'planet',
				radius: 38.8, // units are AU
				position: {
					x: 0,	y: 0,	z: 31060
				}
			},
			{
				name: 'Pluto',
				type: 'planet',
				radius: 1.8, // units are AU
				position: {
					x: 0,	y: 0,	z: 40530
				}
			},

		]
	};
  	for (var i = 0; i < scene_setup.objects.length; i++) {
  		switch(scene_setup.objects[i].type) {
  			case 'planet': 
  				L.scenograph.scene.add(
  					this.make_planet(
  						scene_setup.objects[i].name, 
  						scene_setup.objects[i].position, 
  						scene_setup.objects[i].radius)
  				);
  				break;
  			case 'sun':
  				var sun = this.make_sun(scene_setup.objects[i].position, scene_setup.objects[i].radius); 
  				L.scenograph.scene.add(sun);
  				L.scenograph.scene_variables.target = sun;
  				break;
  			default:
  				console.log("Failed to load object:");
  				console.log(scene_setup.objects[i]);
  				break;
  		}
  	}
  	L.scenograph.animation_queue.push(new this.select_planet());
  	return this;
}

epochexordium.prototype._init = function() {
	L.director.epochexordium = new epochexordium();
}

epochexordium.prototype.select_planet = function() {
	this.animate = function(delta) {
		if (L.scenograph.cursor.leftClick == true) {
			L.scenograph.projector.unprojectVector(L.scenograph.cursor.position, L.scenograph.camera);
			var raycaster = new THREE.Raycaster( L.scenograph.camera.position, L.scenograph.cursor.position.sub( L.scenograph.camera.position ).normalize() );	

			var intersects = raycaster.intersectObjects( L.scenograph.scene.children );
			if (intersects.length > 0) {
				if (intersects[0].object.name != 'Space Box' && 
					intersects[0].object.name != 'Sun Halo' && 
					intersects[0].object.name != 'Sun') {
					var vector = intersects[0].object.position.clone();
					L.scenograph.scene_variables.target = intersects[0].object;
					L.scenograph.controls.target.set(
						vector.x,
						vector.y,
						vector.z
					);
				}
			}
		}
	}
	return this;
}

epochexordium.prototype.make_sun = function(position, radius) {
	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: L.scenograph.effects.sun_uniforms,
		vertexShader:   document.getElementById( 'sunVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'sunFragShader' ).textContent,
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending
	}   );
	// Sphere parameters: radius, segments along width, segments along height
	
	var sphere = new THREE.Mesh( new THREE.SphereGeometry( radius, 32, 32 ), customMaterial );
	sphere.position.set(position.x, position.y, position.z);
	sphere.name = 'Sun'

	customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: {  },
		vertexShader:   document.getElementById( 'haloVertShader'   ).textContent,
		fragmentShader: document.getElementById( 'haloFragShader' ).textContent,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	}   );
		
	var ballGeometry = new THREE.SphereGeometry( radius * 1.05, 32, 32 );
	var ball = new THREE.Mesh( ballGeometry, customMaterial );
	L.scenograph.scene.add( ball );
	ball.name = 'Sun Halo'

	return sphere;
}
epochexordium.prototype.make_planet = function(name, position, radius) {
	var planet = THREEx.Planets['create' + name]();
	planet.name = name;
	planet.material.map.anisotropy = L.scenograph.renderer.getMaxAnisotropy();
	
	if (radius < 20) {
		radius *= 20;
	}
	else {
		radius *= 6;
	}

	var spritey = this.makeTextSprite( name, 
		{ fontsize: 48, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
	spritey.position.set(0,1,0);
	//planet.add(spritey)

	if (name == 'Earth') {
		var clouds    = THREEx.Planets.createEarthCloud()
		planet.add(clouds)
	}

	if (name == 'Saturn' || name == 'Uranus') {
		var mesh    = THREEx.Planets['create' +name+'Ring']();
		planet.add(mesh)
	}

	planet.position.set(position.x, position.y, position.z);
	planet.scale.set(radius,radius,radius)
	
	var animation_obj = {
		animate: function(delta) {
			planet.rotation.y += delta / radius / 100;
			planet.position.x = position.z  * Math.sin( position.z  -L.scenograph.stats.time.now / 150000);
			planet.position.z = position.z  * Math.cos( position.z  -L.scenograph.stats.time.now / 150000);
			var target = L.scenograph.scene_variables.target.position.clone();
			L.scenograph.controls.target.set(
				target.x,
				target.y,
				target.z
			);
		}
	};

	L.scenograph.animation_queue.push(animation_obj);

	return planet;
}

epochexordium.prototype.makeTextSprite = function ( message, parameters ) {
	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 18;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 4;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
		
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	this.roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( 
		{ map: texture, useScreenCoordinates: false } );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(100,50,1.0);
	return sprite;	
}

// function for drawing rounded rectangles
epochexordium.prototype.roundRect = function (ctx, x, y, w, h, r)  {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}
