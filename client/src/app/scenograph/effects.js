/**
 * Effects systems
 * - Particle emitters
 * - Post processing
 */

import setupParticles from './effects/particles.js';
import setupPostProcessing from './effects/postprocessing.js';

export default class Effects {
    particles;
    postprocessing;

    init() {
        l.current_scene.effects.particles = setupParticles();

        l.current_scene.animation_queue.push(
            l.current_scene.effects.particles.animateShipThrusters
        );

        if ( !l.config.settings.fast ) {
            l.current_scene.renderers.webgl.shadowMap.enabled = true;
            l.current_scene.effects.postprocessing = setupPostProcessing();
        }
    }
}
