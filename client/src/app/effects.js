import * as THREE from 'three';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SSAARenderPass } from 'three/addons/postprocessing/SSAARenderPass.js';
import { brightenMaterial } from './materials';



// Define a threshold frame rate below which effects will be disabled
const frameRateThreshold = 60; // Adjust as needed

// Store the previous frame time
let previousFrameTime = 1;

// Define the delay duration (in seconds)
const delayDuration = 5; // Adjust as needed
let delayTimer = 0; // Timer to track the delay duration

let frameRates = [];

let firstTime = true;

let avgFrameRate = 0;

// Run scaling
let scalingRun;

// Dynamically scale the effects to maintain minimum FPS
export function scaleEffects( ) {
  // Run scaling
  scalingRun = setInterval( () => {
    if ( window.l.current_scene.effects.scaleDone ) {
      if ( !firstTime ) {
        clearInterval(scalingRun);
      }
    }
    else {
      scaleEffectsRunner( );
    }
  }, 10);
  
}

export function scaleEffectsRunner ( ) {

  // Calculate the time elapsed since the previous frame
  //const deltaTime = (currentTime - previousFrameTime) / 1000; // Convert to seconds
  delayTimer += 100;

   // Update previous frame time
  //previousFrameTime = currentTime;

  // Check if the delay duration has passed
  if  ( delayTimer >= delayDuration && frameRates.length > frameRateThreshold * delayDuration ) {
    
    var sum = frameRates.reduce(function (total, num) {
      return total + num;
    }, 0);
  
    avgFrameRate = sum / frameRates.length;

    // Check if the frame rate is below the threshold
    const isBelowThreshold = avgFrameRate < (window.l.current_scene.fast ? frameRateThreshold : frameRateThreshold * 0.5) ;

    if (isBelowThreshold) {
      console.log(avgFrameRate + " FPS too low, effects off");
      // Disable effects
      window.l.current_scene.fast = true;
      window.l.current_scene.renderers.webgl.shadowMap.enabled = false;
      if (window.l.current_scene.effects.main && window.l.current_scene.effects.main.passes && window.l.current_scene.effects.main.passes.length > 0 ) {
        window.l.current_scene.effects.main.passes.splice(0, window.l.current_scene.effects.main.passes.length); // Remove all passes from the  (*window.l.current_scene.effects.main)
      }
    }
    else {
      console.log(avgFrameRate + " FPS good, effects on");
      // Setup effects.
      if (!window.l.current_scene.effects.main || ! window.l.current_scene.effects.main.passes || window.l.current_scene.effects.main.passes.length == 0 ) {
        setupEffects();
      }
      // Enable effects
      window.l.current_scene.fast = false;
      window.l.current_scene.renderers.webgl.shadowMap.enabled = true;
    }

    // Update lights to the correct settings.
    window.l.current_scene.scene_objects.ambientLight.color = new THREE.Color( window.l.current_scene.fast ? 0x555555 : 0x444444 );
    window.l.current_scene.scene_objects.neon_sign.children[0].intensity = window.l.current_scene.fast ? window.l.current_scene.settings.light.fast.neonSign.normal : window.l.current_scene.settings.light.highP.neonSign.normal;
    window.l.current_scene.scene.traverse((scene_object)=> {
      if (scene_object.name =='ceilLightActual') {
        scene_object.intensity = window.l.current_scene.fast ? window.l.current_scene.settings.light.fast.desk.normal : window.l.current_scene.settings.light.highP.desk.normal;
      }
      if (scene_object.name =='deskMesh') {
        scene_object.traverse( function ( child ) {

          if ( child.isMesh ) {
    
            let amount = window.l.current_scene.fast ? 3 : 1.5;
            child.material = child.original_material.clone();
            brightenMaterial( child.material, amount);
          }
        });
        
      }
    });

    window.l.current_scene.effects.scaleDone = true;

    // Enqueue a secondary scaler just in case the first one failed.
    if ( firstTime ) {
      setTimeout(()=>{
        avgFrameRate = 0;
        frameRates = [];
        delayTimer = 0;
        window.l.current_scene.effects.scaleDone = false;
        firstTime = false;
      }, 5000)
    }
    
  }
  // Otherwise keep counting frames.
  else {
    frameRates.push( window.l.current_scene.stats.fps );
  }

}

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
