/**
 * Materials related helpers.
 */

/**
 * Vendor libs
 */
import * as THREE from 'three';

/**
 * Brighten material helper.
 * 
 * @param {THREE.Maetrial} material 
 * @param {Float} amount 
 * @returns 
 */
export function brightenMaterial(material, amount) {

  if (material.map) {
    // Increase the brightness of the texture
    material.map.magFilter = THREE.LinearFilter; // Ensures smooth interpolation
    material.map.needsUpdate = true; // Update the material
  }
  
  amount = window.l.current_scene.fast ? amount / 4 : amount;

  // Increase the brightness by adjusting the material color
  const brightness = amount; // Increase the value to make it brighter
  material.color.setRGB(
    material.color.r * brightness,
    material.color.g * brightness,
    material.color.b * brightness
  );

  return material;
}

export function proceduralMetalMaterial(settings) {

  const gradientGLSL = document.getElementById( 'gradientGLSL' ).textContent;
  const voronoiGLSL = document.getElementById( 'voronoiGLSL' ).textContent;
  
  THREE.ShaderChunk['gradient'] = gradientGLSL;
  THREE.ShaderChunk['voronoi'] = voronoiGLSL;


  // @todo: Move into a common helper / in memory store.
  let noiseTexture2 = window.l.current_scene.loaders.texture.load( './assets/textures/noise2.jpg' );
  noiseTexture2.wrapS = noiseTexture2.wrapT = THREE.RepeatWrapping;

  settings.uniforms.noiseTexture = noiseTexture2;

  let material = new THREE.ShaderMaterial( {
    vertexShader:   document.getElementById( 'proceduralMetalVertShader'   ).textContent,
    fragmentShader: document.getElementById( 'proceduralMetalFragShader' ).textContent,
    uniforms: settings.uniforms
  } );

  material.metalness = 0.9;
  material.roughess = 0.1;

  return material;

}