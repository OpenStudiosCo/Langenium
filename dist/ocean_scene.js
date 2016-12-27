var hash = document.location.hash.substr( 1 );
if ( hash ) hash = parseInt( hash, 0 );
// Texture width for simulation
var WIDTH = hash || 128;
var NUM_TEXELS = WIDTH * WIDTH;
// Water size in system units
var BOUNDS = 512;
var BOUNDS_HALF = BOUNDS * 0.5;
var container, stats, waterMirror;
var camera, scene, renderer, controls;
var mouseMoved = false;
var mouseCoords = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var waterMesh;
var meshRay;
var gpuCompute;
var heightmapVariable;
var waterUniforms;
var smoothShader;
var simplex = new SimplexNoise();
var ratio = window.innerWidth/window.innerHeight;
var containerWidth = document.getElementsByClassName( 'ocean_scene' )[0].offsetWidth;
var containerHeight = (
  (document.getElementsByClassName( 'ocean_scene' )[0].offsetHeight > 400)
  ? document.getElementsByClassName( 'ocean_scene' )[0].offsetHeight
  : document.getElementsByClassName( 'ocean_scene' )[0].offsetWidth / ratio
);
var windowHalfX = containerWidth / 2;
var windowHalfY = containerHeight / 2;
document.getElementById( 'waterSize' ).innerText = WIDTH + ' x ' + WIDTH;
function change(n) {
  location.hash = n;
  location.reload();
  return false;
}
var options = '';
for ( var i = 4; i < 10; i++ ) {
  var j = Math.pow( 2, i );
  options += '<a href="#" onclick="return change(' + j + ')">' + j + 'x' + j + '</a> ';
}
document.getElementById('options').innerHTML = options;
init();
animate();
function init() {
  container = document.getElementsByClassName( 'ocean_scene' )[0];
  camera = new THREE.PerspectiveCamera( 75, ratio, 1, 3000 );
  camera.position.set( 0, 200, 350 );
  scene = new THREE.Scene();
  var sun = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
  sun.position.set( 300, 400, 175 );
  scene.add( sun );
  var sun2 = new THREE.DirectionalLight( 0x40A040, 0.6 );
  sun2.position.set( -100, 350, -200 );
  scene.add( sun2 );
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0x000000 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( containerWidth, containerHeight );
  container.appendChild( renderer.domElement );
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  stats = new Stats();
  container.appendChild( stats.dom );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  document.addEventListener( 'keydown', function( event ) {
    // W Pressed: Toggle wireframe
    if ( event.keyCode === 87 ) {
      waterMesh.material.wireframe = ! waterMesh.material.wireframe;
      waterMesh.material.needsUpdate = true;
    }
  } , false );
  window.addEventListener( 'resize', onWindowResize, false );
  var gui = new dat.GUI();
  var effectController = {
    mouseSize: 20.0,
    viscosity: 0.03
  };
  var valuesChanger = function() {
    heightmapVariable.material.uniforms.mouseSize.value = effectController.mouseSize;
    heightmapVariable.material.uniforms.viscosityConstant.value = effectController.viscosity;
  };
  gui.add( effectController, "mouseSize", 1.0, 100.0, 1.0 ).onChange( valuesChanger );
  gui.add( effectController, "viscosity", 0.0, 0.1, 0.001 ).onChange( valuesChanger );
  var buttonSmooth = {
      smoothWater: function() {
    smoothWater();
      }
  };
  gui.add( buttonSmooth, 'smoothWater' );
  initWater();

  var material2 = new THREE.MeshLambertMaterial( { color: 0x11CCFF, transparent: true, opacity: 0.85, side: THREE.DoubleSide } );
  var sphere = new THREE.Mesh(new THREE.SphereGeometry(50, 200, 100), material2);
  sphere.position.set(0, 100, -10);
  scene.add(sphere);

  valuesChanger();
}
function initWater() {
  var materialColor = 0x0040C0;
  var geometry = new THREE.PlaneBufferGeometry( BOUNDS, BOUNDS, WIDTH - 1, WIDTH -1 );
  // material: make a ShaderMaterial clone of MeshPhongMaterial, with customized vertex shader
  var material = new THREE.ShaderMaterial( {
    uniforms: THREE.UniformsUtils.merge( [
      THREE.ShaderLib[ 'phong' ].uniforms,
      {
        heightmap: { value: null }
      }
    ] ),
    vertexShader: document.getElementById( 'waterVertexShader' ).textContent,
    fragmentShader: THREE.ShaderChunk[ 'meshphong_frag' ]
  } );
  material.lights = true;
  // Material attributes from MeshPhongMaterial
  material.color = new THREE.Color( materialColor );
  material.specular = new THREE.Color( 0x111111 );
  material.shininess = 50;
  // Sets the uniforms with the material values
  material.uniforms.diffuse.value = material.color;
  material.uniforms.specular.value = material.specular;
  material.uniforms.shininess.value = Math.max( material.shininess, 1e-4 );
  material.uniforms.opacity.value = material.opacity;
  // Defines
  material.defines.WIDTH = WIDTH.toFixed( 1 );
  material.defines.BOUNDS = BOUNDS.toFixed( 1 );
  waterUniforms = material.uniforms;
  
  // ライト
  var directionalLight = new THREE.DirectionalLight('#FFFFFF', 1);
  directionalLight.position.set(0, 10, 10);
  scene.add(directionalLight);

  var directionalLight2 = new THREE.DirectionalLight('#FFFFFF', 1);
  directionalLight2.position.set(0, 10, -10);
  scene.add(directionalLight2);
  waterMirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: 600, textureHeight: 600, color: 0x889999 } );
  waterMesh = new THREE.Mesh( geometry, material );
  waterMesh.rotation.x = - Math.PI / 2;
  waterMesh.matrixAutoUpdate = false;
  waterMesh.updateMatrix();
  scene.add( waterMesh );
  // Mesh just for mouse raycasting
  var geometryRay = new THREE.PlaneBufferGeometry( BOUNDS, BOUNDS, 1, 1 );
  meshRay = new THREE.Mesh( geometryRay, new THREE.MeshBasicMaterial( { color: 0xFFFFFF, visible: false } ) );
  meshRay.rotation.x = - Math.PI / 2;
  meshRay.matrixAutoUpdate = false;
  meshRay.updateMatrix();
  scene.add( meshRay );
  // Creates the gpu computation class and sets it up
  gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );
  var heightmap0 = gpuCompute.createTexture();
  fillTexture( heightmap0 );
  heightmapVariable = gpuCompute.addVariable( "heightmap", document.getElementById( 'heightmapFragmentShader' ).textContent, heightmap0 );
  gpuCompute.setVariableDependencies( heightmapVariable, [ heightmapVariable ] );
  heightmapVariable.material.uniforms.mousePos = { value: new THREE.Vector2( 10000, 10000 ) };
  heightmapVariable.material.uniforms.mouseSize = { value: 20.0 };
  heightmapVariable.material.uniforms.viscosityConstant = { value: 0.03 };
  heightmapVariable.material.defines.BOUNDS = BOUNDS.toFixed( 1 );
  var error = gpuCompute.init();
  if ( error !== null ) {
      console.error( error );
  }
  // Create compute shader to smooth the water surface and velocity
  smoothShader = gpuCompute.createShaderMaterial( document.getElementById( 'smoothFragmentShader' ).textContent, { texture: { value: null } } );
}
function fillTexture( texture ) {
  var waterMaxHeight = 10;
  function noise( x, y, z ) {
    var multR = waterMaxHeight;
    var mult = 0.025;
    var r = 0;
    for ( var i = 0; i < 15; i++ ) {
      r += multR * simplex.noise3d( x * mult, y * mult, z * mult );
      multR *= 0.53 + 0.025 * i;
      mult *= 1.25;
    }
    return r;
  }
  var pixels = texture.image.data;
  var p = 0;
  for ( var j = 0; j < WIDTH; j++ ) {
    for ( var i = 0; i < WIDTH; i++ ) {
      var x = i * 128 / WIDTH;
      var y = j * 128 / WIDTH;
            pixels[ p + 0 ] = noise( x, y, 123.4 );
      pixels[ p + 1 ] = 0;
      pixels[ p + 2 ] = 0;
      pixels[ p + 3 ] = 1;
      p += 4;
    }
  }
}
function smoothWater() {
  var currentRenderTarget = gpuCompute.getCurrentRenderTarget( heightmapVariable );
  var alternateRenderTarget = gpuCompute.getAlternateRenderTarget( heightmapVariable );
  for ( var i = 0; i < 10; i++ ) {
    smoothShader.uniforms.texture.value = currentRenderTarget.texture;
    gpuCompute.doRenderTarget( smoothShader, alternateRenderTarget );
    smoothShader.uniforms.texture.value = alternateRenderTarget.texture;
    gpuCompute.doRenderTarget( smoothShader, currentRenderTarget );
  }
  
}
function onWindowResize() {
  containerWidth = document.getElementsByClassName( 'ocean_scene' )[0].offsetWidth;
  containerHeight = (
    (document.getElementsByClassName( 'ocean_scene' )[0].offsetHeight > 400)
    ? document.getElementsByClassName( 'ocean_scene' )[0].offsetHeight
    : document.getElementsByClassName( 'ocean_scene' )[0].offsetWidth / ratio
  );
  windowHalfX = containerWidth / 2;
  windowHalfY = containerHeight / 2;
  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( containerWidth, containerHeight );
}
function setMouseCoords( x, y ) {
  mouseCoords.set( 
    ( x / (renderer.domElement.clientWidth + container.offsetLeft * 2 + window.scrollX) ) * 2 - 1, 
    - ( y / (renderer.domElement.clientHeight + container.offsetTop * 2 - window.scrollY * 2) ) * 2 + 1 
  );
  mouseMoved = true;
}
function onDocumentMouseMove( event ) {
  setMouseCoords( event.clientX, event.clientY );
}
function onDocumentTouchStart( event ) {
  if ( event.touches.length === 1 ) {
    event.preventDefault();
    setMouseCoords( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
  }
}
function onDocumentTouchMove( event ) {
  if ( event.touches.length === 1 ) {
    event.preventDefault();
    setMouseCoords( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
  }
}
function animate() {
  requestAnimationFrame( animate );
  render();
  stats.update();
}
function render() {
  // Set uniforms: mouse interaction
  var uniforms = heightmapVariable.material.uniforms;
  if ( mouseMoved ) {
    this.raycaster.setFromCamera( mouseCoords, camera );
    var intersects = this.raycaster.intersectObject( meshRay );
    if ( intersects.length > 0 ) {
        var point = intersects[ 0 ].point;
        uniforms.mousePos.value.set( point.x, point.z );
    }
    else {
        uniforms.mousePos.value.set( 10000, 10000 );
    }
    mouseMoved = false;
  }
  else {
    uniforms.mousePos.value.set( 10000, 10000 );
  }
  // Do the gpu computation
  gpuCompute.compute();
  // Get compute output in custom uniform
  waterUniforms.heightmap.value = gpuCompute.getCurrentRenderTarget( heightmapVariable ).texture;

  waterMirror.render();
  // Render
  renderer.render( scene, camera );
}