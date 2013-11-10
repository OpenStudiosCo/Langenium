/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	Engine
	This contains the classes that manages the 3D engine.renderer
	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

// This object
var engine = function() {
    
    /* Game engine */
	this.renderer,
	this.scene = new THREE.Scene();
	this.duration = 150,
	this.keyframes = 5,
	this.interpolation = this.duration / this.keyframes;
	// Not implemented yet, but will be used for simplifying animation queue

    return this;
}

/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Function definitions
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

engine.prototype.animate = function () {
	var delta = clock.getDelta();

	if (player && controls.enabled == true) {
		if (controls.camera_rotating == true) {
				controls.rotateCamera(delta)
			}
		if (controls.flight.enabled == true) {
			
			controls.flight.move(player.velocity, player.position, controls.flight.input(delta));
		}
		if (controls.character.enabled == true) {
			
			controls.character.input(delta);
		}
	}
	
	if (window.location.href.indexOf("editor") > 0) {
		controls.editor.input(delta);
		editor.toolbars.updateCameraDetails();
	}

	// Animating ship meshes
	var animTime = new Date().getTime() % engine.duration;
	var keyframe = Math.floor( animTime / engine.interpolation );

	objects.ships.animation_queue.forEach(function(ship){
		objects.ships.animate(animTime, keyframe, ship, delta);
	});

	// Animating sprites
	textures.sprites.animation_queue.forEach(function(sprite){
		sprite.animation.animate(sprite.moving, sprite.face, delta);
	});
	
	TWEEN.update();
	effects.water.animate(delta);
	effects.particles.handleParticles(delta);
	effects.particles.animateThrusters(delta);
	effects.particles.animateShipThrusters(delta);
	effects.bullets.handleBullets(delta);

	requestAnimationFrame( engine.animate );

	// Reflection code
	//engine.renderer.render( scene, effects.water.textureCamera, effects.water.firstRenderTarget, true );
	//engine.renderer.render( effects.water.screenScene, effects.water.screenCamera, effects.water.finalRenderTarget, true );

	engine.renderer.render( engine.scene, client.camera );

}