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

export function proceduralBuilding(settings) {

  const brickGLSL = document.getElementById( 'brickGLSL' ).textContent;
  const gradientGLSL = document.getElementById( 'gradientGLSL' ).textContent;
  const normalGLSL = document.getElementById( 'normalGLSL' ).textContent;
  const voronoiGLSL = document.getElementById( 'voronoiGLSL' ).textContent;
  
  THREE.ShaderChunk['brick'] = brickGLSL;
  THREE.ShaderChunk['gradient'] = gradientGLSL;
  THREE.ShaderChunk['normal'] = normalGLSL;
  THREE.ShaderChunk['voronoi'] = voronoiGLSL;

  // @todo: Move into a common helper / in memory store.
  let noiseTexture2 = window.l.current_scene.loaders.texture.load( './assets/textures/noise2.jpg' );
  noiseTexture2.wrapS = noiseTexture2.wrapT = THREE.RepeatWrapping;

  settings.uniforms.noiseTexture = noiseTexture2;

  let material = new THREE.ShaderMaterial( {
    vertexShader:   document.getElementById( 'proceduralBuildingVertShader'   ).textContent,
    fragmentShader: document.getElementById( 'proceduralBuildingFragShader' ).textContent,
    uniforms: settings.uniforms
  } );

  material.metalness = 0.9;
  material.roughess = 0.1;

  return material;

}

export function proceduralMetalMaterial(settings) {

  const gradientGLSL = document.getElementById( 'gradientGLSL' ).textContent;
  const normalGLSL = document.getElementById( 'normalGLSL' ).textContent;
  const voronoiGLSL = document.getElementById( 'voronoiGLSL' ).textContent;
  
  THREE.ShaderChunk['gradient'] = gradientGLSL;
  THREE.ShaderChunk['normal'] = normalGLSL;
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

  //let cached_material = cacheProceduralMaterial ( material );
  //return cached_material;

  return material;

}

export function proceduralMetalMaterial2(settings) {

  const brickGLSL = document.getElementById( 'brickGLSL' ).textContent;
  const gradientGLSL = document.getElementById( 'gradientGLSL' ).textContent;
  const normalGLSL = document.getElementById( 'normalGLSL' ).textContent;
  const voronoiGLSL = document.getElementById( 'voronoiGLSL' ).textContent;
  
  THREE.ShaderChunk['brick'] = brickGLSL;
  THREE.ShaderChunk['gradient'] = gradientGLSL;
  THREE.ShaderChunk['normal'] = normalGLSL;
  THREE.ShaderChunk['voronoi'] = voronoiGLSL;

  // @todo: Move into a common helper / in memory store.
  let noiseTexture2 = window.l.current_scene.loaders.texture.load( './assets/textures/noise2.jpg' );
  noiseTexture2.wrapS = noiseTexture2.wrapT = THREE.RepeatWrapping;

  settings.uniforms.noiseTexture = noiseTexture2;

  let material = new THREE.ShaderMaterial( {
    vertexShader:   document.getElementById( 'proceduralMetal2VertShader'   ).textContent,
    fragmentShader: document.getElementById( 'proceduralMetal2FragShader' ).textContent,
    uniforms: settings.uniforms
  } );

  material.metalness = 0.9;
  material.roughess = 0.1;

  return material;

}

// @todo: Figure out how to get this working for optimisation.
export function cacheProceduralMaterial( material ) {
  const textureHeight = 512;
  const textureWidth = 512;
  const renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight);
  // Scene and camera for first pass
  const firstPassScene = new THREE.Scene();
  const firstPassCamera = new THREE.Camera();

  // Mesh for first pass
  const firstPassQuad = new THREE.Mesh(new THREE.PlaneGeometry( 2 * material.uniforms.scale.value, 2 * material.uniforms.scale.value), material);
  firstPassScene.add(firstPassQuad);


  // Render the first pass to the render target
  window.l.current_scene.renderers.webgl.setRenderTarget(renderTarget);
  window.l.current_scene.renderers.webgl.render(firstPassScene, firstPassCamera);
  window.l.current_scene.renderers.webgl.setRenderTarget(null); // Reset the render target

  const secondPassMaterial = new THREE.MeshBasicMaterial({
    map: renderTarget.texture,
  });

  // Append img tag to DOM for preview
  document.getElementById('preview_materials').appendChild(renderTargetToImage( renderTarget, textureWidth, textureHeight ));

  return secondPassMaterial;
}

export function renderTargetToImage( renderTarget, textureWidth, textureHeight ) {

  // Read pixels from renderTarget and convert to image
  const pixels = new Uint8Array(textureWidth * textureHeight * 4);
  window.l.current_scene.renderers.webgl.readRenderTargetPixels(renderTarget, 0, 0, textureWidth, textureHeight, pixels);

  // Create a canvas element to convert pixels to image
  const canvas = document.createElement('canvas');
  canvas.width = textureWidth;
  canvas.height = textureHeight;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(textureWidth, textureHeight);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);

  // Convert canvas to data URL and set as src for img tag
  const imageUrl = canvas.toDataURL(); // default is PNG format
  const img = document.createElement('img');
  img.src = imageUrl;
  img.height = 256;
  img.width = 256;

  return img;

}