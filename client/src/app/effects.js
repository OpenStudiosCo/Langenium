/**
 * Vendor libs
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SSAARenderPass } from 'three/addons/postprocessing/SSAARenderPass.js';


// Sets up the effects
export function setupEffects( ) {
  // Apply Unreal Bloom post-processing effect
  var renderScene = new RenderPass(  window.l.current_scene.scene, window.l.current_scene.camera);

  window.l.current_scene.effects.main = new EffectComposer(window.l.current_scene.renderers.webgl);
  window.l.current_scene.effects.main.setSize(window.innerWidth, window.innerHeight);
  window.l.current_scene.effects.main.addPass(renderScene);

  window.l.current_scene.renderers.webgl.shadowMap.enabled = true;
  window.l.current_scene.renderers.webgl.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  const ssaoPass = new SSAOPass( window.l.current_scene.scene, window.l.current_scene.camera, window.innerWidth, window.innerHeight );
  ssaoPass.kernelRadius = 20;
  ssaoPass.output = SSAOPass.OUTPUT.Beauty;
  window.l.current_scene.effects.main.addPass( ssaoPass );

  const ssaaPass = new SSAARenderPass ( window.l.current_scene.scene, window.l.current_scene.camera );
  ssaaPass.sampleLevel = 1;
  window.l.current_scene.effects.main.addPass( ssaaPass );
    
  window.l.current_scene.effects.bloomLayer = new THREE.Layers();
  window.l.current_scene.effects.bloomLayer.set( 1 );

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0.15;
  bloomPass.strength = .85;
  bloomPass.radius = 0.85;

  window.l.current_scene.effects.bloom = new EffectComposer( window.l.current_scene.renderers.webgl );
  window.l.current_scene.effects.bloom.setSize(window.innerWidth, window.innerHeight);
  window.l.current_scene.effects.bloom.renderToScreen = false;
  window.l.current_scene.effects.bloom.addPass( renderScene );
  window.l.current_scene.effects.bloom.addPass( bloomPass );

  // Selectively unbloom things
  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial( {
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: window.l.current_scene.effects.bloom.renderTarget2.texture }
      },
      vertexShader: document.getElementById( 'vertexshader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
      defines: {}
    } ), 'baseTexture'
  );
  mixPass.needsSwap = true;

  window.l.current_scene.effects.main.addPass( mixPass );

  // Colour correction.
  // const tonePass = new OutputPass(THREE.CineonToneMapping  );
  // tonePass.toneMappingExposure = Math.pow(Math.PI / 3, 4.0);
  // window.l.current_scene.effects.main.addPass( tonePass );

}
