/**
 * Effects systems
 * - Particle emitters
 * - Post processing
 */

import setupParticles from './effects/particles.js';
import setupPostProcessing from './effects/postprocessing.js';

// Sets up the postprocessing effects
export function setupEffects( ) {

  window.l.current_scene.effects.particles = setupParticles();
  
  window.l.current_scene.animation_queue.push(
    window.l.current_scene.effects.particles.animateShipThrusters
  );

  if (!window.l.current_scene.fast) {
    window.l.current_scene.renderers.webgl.shadowMap.enabled = true;
    window.l.current_scene.effects.postprocessing = setupPostProcessing();
  }
}
