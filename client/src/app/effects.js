import * as THREE from 'three';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SSAARenderPass } from 'three/addons/postprocessing/SSAARenderPass.js';
import { brightenMaterial } from './furniture';



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
    if ( window.virtual_office.effects.scaleDone ) {
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
    const isBelowThreshold = avgFrameRate < (window.virtual_office.fast ? frameRateThreshold : frameRateThreshold * 0.5) ;

    if (isBelowThreshold) {
      console.log(avgFrameRate + " FPS too low, effects off");
      // Disable effects
      window.virtual_office.fast = true;
      window.virtual_office.renderers.webgl.shadowMap.enabled = false;
      if (window.virtual_office.effects.main && window.virtual_office.effects.main.passes && window.virtual_office.effects.main.passes.length > 0 ) {
        window.virtual_office.effects.main.passes.splice(0, window.virtual_office.effects.main.passes.length); // Remove all passes from the  (*window.virtual_office.effects.main)
      }
    }
    else {
      console.log(avgFrameRate + " FPS good, effects on");
      // Setup effects.
      if (!window.virtual_office.effects.main || ! window.virtual_office.effects.main.passes || window.virtual_office.effects.main.passes.length == 0 ) {
        setupEffects();
      }
      // Enable effects
      window.virtual_office.fast = false;
      window.virtual_office.renderers.webgl.shadowMap.enabled = true;
    }

    // Update lights to the correct settings.
    window.virtual_office.scene_objects.ambientLight.color = new THREE.Color( window.virtual_office.fast ? 0x555555 : 0x444444 );
    window.virtual_office.scene_objects.neon_sign.children[0].intensity = window.virtual_office.fast ? window.virtual_office.settings.light.fast.neonSign.normal : window.virtual_office.settings.light.highP.neonSign.normal;
    window.virtual_office.scene.traverse((scene_object)=> {
      if (scene_object.name =='ceilLightActual') {
        scene_object.intensity = window.virtual_office.fast ? window.virtual_office.settings.light.fast.desk.normal : window.virtual_office.settings.light.highP.desk.normal;
      }
      if (scene_object.name =='deskMesh') {
        scene_object.traverse( function ( child ) {

          if ( child.isMesh ) {
    
            let amount = window.virtual_office.fast ? 3 : 1.5;
            child.material = child.original_material.clone();
            brightenMaterial( child.material, amount);
          }
        });
        
      }
    });

    window.virtual_office.effects.scaleDone = true;

    // Enqueue a secondary scaler just in case the first one failed.
    if ( firstTime ) {
      setTimeout(()=>{
        avgFrameRate = 0;
        frameRates = [];
        delayTimer = 0;
        window.virtual_office.effects.scaleDone = false;
        firstTime = false;
      }, 5000)
    }
    
  }
  // Otherwise keep counting frames.
  else {
    frameRates.push( window.virtual_office.fps );
  }

}

// Sets up the effects
export function setupEffects( ) {
  // Apply Unreal Bloom post-processing effect
  var renderScene = new RenderPass(  window.virtual_office.scene, window.virtual_office.camera);

  window.virtual_office.effects.main = new EffectComposer(window.virtual_office.renderers.webgl);
  window.virtual_office.effects.main.setSize(window.innerWidth, window.innerHeight);
  window.virtual_office.effects.main.addPass(renderScene);

  window.virtual_office.renderers.webgl.shadowMap.enabled = true;
  window.virtual_office.renderers.webgl.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  const ssaoPass = new SSAOPass( window.virtual_office.scene, window.virtual_office.camera, window.innerWidth, window.innerHeight );
  ssaoPass.kernelRadius = 20;
  ssaoPass.output = SSAOPass.OUTPUT.Beauty;
  window.virtual_office.effects.main.addPass( ssaoPass );

  const ssaaPass = new SSAARenderPass ( window.virtual_office.scene, window.virtual_office.camera );
  ssaaPass.sampleLevel = 1;
  window.virtual_office.effects.main.addPass( ssaaPass );
    
  window.virtual_office.effects.bloomLayer = new THREE.Layers();
  window.virtual_office.effects.bloomLayer.set( 1 );

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0.15;
  bloomPass.strength = .85;
  bloomPass.radius = 0.85;

  window.virtual_office.effects.bloom = new EffectComposer( window.virtual_office.renderers.webgl );
  window.virtual_office.effects.bloom.setSize(window.innerWidth, window.innerHeight);
  window.virtual_office.effects.bloom.renderToScreen = false;
  window.virtual_office.effects.bloom.addPass( renderScene );
  window.virtual_office.effects.bloom.addPass( bloomPass );

  const mixPass = new ShaderPass(
    new THREE.ShaderMaterial( {
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: window.virtual_office.effects.bloom.renderTarget2.texture }
      },
      vertexShader: document.getElementById( 'vertexshader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
      defines: {}
    } ), 'baseTexture'
  );
  mixPass.needsSwap = true;

  window.virtual_office.effects.main.addPass( mixPass );

  const tonePass = new OutputPass(THREE.ACESFilmicToneMapping);
  tonePass.toneMappingExposure = Math.pow(Math.PI / 3, 4.0);
  window.virtual_office.effects.main.addPass( tonePass );

}
