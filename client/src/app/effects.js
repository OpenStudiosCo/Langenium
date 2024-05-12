import * as THREE from 'three';

import {
  // Core stuff
  EffectComposer,
  EffectPass,
  RenderPass,

  // Bloom effect
  SelectiveBloomEffect,

  // Anti aliasing
  EdgeDetectionMode,
  SMAAEffect,
	SMAAPreset,
  
  // SSAO
  BlendFunction,
  DepthDownsamplingPass,
  NormalPass,
  SSAOEffect,
  TextureEffect,

  // Tone Mapping
  ToneMappingEffect,
	ToneMappingMode
} from "postprocessing";

// Sets up the effects
export function setupEffects( ) {
  const composer = new EffectComposer(window.l.current_scene.renderers.webgl, {
    frameBufferType: THREE.HalfFloatType
  });
  composer.addPass(new RenderPass(window.l.current_scene.scene, window.l.current_scene.camera));

  // ssao
  const normalPass = new NormalPass(window.l.current_scene.scene, window.l.current_scene.camera);
  const depthDownsamplingPass = new DepthDownsamplingPass({
    normalBuffer: normalPass.texture,
    resolutionScale: 0.5
  });

  const capabilities = composer.getRenderer().capabilities;

  const normalDepthBuffer = capabilities.isWebGL2 ?
    depthDownsamplingPass.texture : null;

  const ssao = new SSAOEffect(window.l.current_scene.camera, normalPass.texture, {
    blendFunction: BlendFunction.MULTIPLY,
			distanceScaling: true,
			depthAwareUpsampling: true,
			normalDepthBuffer,
			samples: 9,
			rings: 7,
			distanceThreshold: 0.2,	// Render up to a distance of ~20 world units
			distanceFalloff: 0.0025,	// with an additional ~2.5 units of falloff.
			rangeThreshold: 0.0003,		// Occlusion proximity of ~0.3 world units
			rangeFalloff: 0.0001,			// with ~0.1 units of falloff.
			luminanceInfluence: 0.7,
			minRadiusScale: 0.33,
			radius: 0.1,
			intensity: 1.33,
			bias: 0.025,
			fade: 0.01,
			color: null,
			resolutionScale: 0.5
  });

  // smaa
  const smaa = new SMAAEffect({
    blendFunction: EdgeDetectionMode.DEPTH,
    preset: SMAAPreset.HIGH
  } );

  // bloom
  const bloom = new SelectiveBloomEffect(
    window.l.current_scene.scene, window.l.current_scene.camera,
    {
      blendFunction: BlendFunction.ADD,
      intensity: 8.5,
      mipmapBlur: true,
      luminanceThreshold: 0.15,
      luminanceSmoothing: 0.2,
      radius : 0.85,
      resolutionScale: 1
  });

  bloom.inverted = true;

  const textureEffect = new TextureEffect({
    blendFunction: BlendFunction.SKIP,
    texture: depthDownsamplingPass.texture
  });

  const toneMappingEffect = new ToneMappingEffect({
    mode: ToneMappingMode.REINHARD2_ADAPTIVE,
    resolution: 256,
    whitePoint: 16.0,
    middleGrey: 0.6,
    minLuminance: 0.01,
    averageLuminance: 0.01,
    adaptationRate: 1.0
  });

  composer.addPass(normalPass);

  if(capabilities.isWebGL2) {

    composer.addPass(depthDownsamplingPass);

  } else {

    console.log("WebGL 2 not supported, falling back to naive depth downsampling");

  }
  
  composer.addPass(new EffectPass(window.l.current_scene.camera, ssao, smaa, textureEffect, bloom, toneMappingEffect));
  window.l.current_scene.effects = composer;

}
