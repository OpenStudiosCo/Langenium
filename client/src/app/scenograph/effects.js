/**
 * Effects systems
 * - Particle emitters
 * - Post processing
 */

/**
 * Internal libs and helpers.
 */
import l from '@/helpers/l.js';
import Trail from '@/scenograph/effects/trail.js';
import setupParticles from '@/scenograph/effects/particles.js';
import setupPostProcessing from '@/scenograph/effects/postprocessing.js';

export default class Effects {
    particles;
    postprocessing;

    init() {
        l.current_scene.effects.particles = setupParticles();
        l.current_scene.effects.particles.createAtmosphere();
        l.current_scene.effects.particles.createWind();

        l.current_scene.effects.trail = new Trail();

        l.current_scene.animation_queue.push(
            l.current_scene.effects.particles.animateShipThrusters
        );
        l.current_scene.animation_queue.push(
            l.current_scene.effects.particles.animateAtmosphere
        );
        l.current_scene.animation_queue.push(
            l.current_scene.effects.particles.animateWind
        );

        if ( !l.config.settings.fast ) {
            l.current_scene.renderers.webgl.shadowMap.enabled = true;
            l.current_scene.effects.postprocessing = setupPostProcessing();
        }
    }
}
