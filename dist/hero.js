// シーン生成
var scene = new THREE.Scene();
// カメラ生成
var ratio = window.innerWidth/window.innerHeight;

var camera = new THREE.PerspectiveCamera( 35, ratio , 0.1, 100000 );
camera.position.z = 3200;

// レンダラー生
var renderer = new THREE.WebGLRenderer();
// レンダラーのサイズ指定
renderer.setSize( 
  document.getElementsByClassName( 'hero' )[0].offsetWidth, 
  document.getElementsByClassName( 'hero' )[0].offsetWidth / ratio
);

var loader = new THREE.JSONLoader();

var noiseTexture3 = new THREE.TextureLoader().load( "/old/res/textures/noise3.jpg" );
noiseTexture3.wrapS = noiseTexture3.wrapT = THREE.RepeatWrapping;

var water_uniforms = {
  noiseTexture: { type: "t", value: noiseTexture3 },
  time:       { type: "f", value: 1.0 }
},
metal_uniforms = {
  noiseTexture: { type: "t", value: noiseTexture3 },
  time:       { type: "f", value: 1.0 }
};

var logoWaterMaterial = new THREE.ShaderMaterial( 
{
    uniforms: water_uniforms,
    vertexShader:   document.getElementById( 'logoWaterVertShader'   ).textContent,
    fragmentShader: document.getElementById( 'logoWaterFragShader' ).textContent,
    side: THREE.DoubleSide
}   );

var logoMetalMaterial = new THREE.ShaderMaterial( 
{
    uniforms: metal_uniforms,
  vertexShader:   document.getElementById( 'logoMetalVertShader'   ).textContent,
  fragmentShader: document.getElementById( 'logoMetalFragShader' ).textContent,
  side: THREE.DoubleSide
}   );

var mesh;
var cb = function(geometry, materials) {
    
  for (var i = 0; i < materials.length; i++) {
    if(materials[i].name == 'Water') {
      materials[i] = logoWaterMaterial;
    }
    if (materials[i].name == 'Metal') {
      materials[i] = logoMetalMaterial;
    }
  }
  geometry.buffersNeedUpdate = true;
  geometry.uvsNeedUpdate = true;
  mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
  mesh.scale.set(2000,2000,2000);
  mesh.position.set(-30,370,0);
  mesh.rotateX( Math.PI / 2 );
  scene.add(mesh);     
}

loader.load('/old/res/models/langenium-logo.js', function(geometry, materials) {
  cb(geometry, materials);
});

var planeGeo = new THREE.PlaneGeometry( 6000,6000 );
// MIRROR planes
groundMirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: 600, textureHeight: 600, color: 0x777777 } );

var mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
mirrorMesh.add( groundMirror );
mirrorMesh.rotateX( - Math.PI / 2 );
mirrorMesh.position.set(0, -110,0);
scene.add( mirrorMesh );

var vignette_geo = new THREE.PlaneGeometry( 6000,6000 );
// create a canvas element
var canvas1 = document.createElement('canvas');
var context1 = canvas1.getContext('2d');
var my_gradient=context1.createLinearGradient(0,0,0,170);
my_gradient.addColorStop(0.2, 'rgba(0,0,0,0)');
my_gradient.addColorStop(0.7,  'rgba(0,0,0,1)');
context1.fillStyle=my_gradient;
context1.fillRect(0,0,canvas1.width,canvas1.height);
  
// canvas contents will be used for a texture
var texture1 = new THREE.Texture(canvas1) 
texture1.needsUpdate = true;
    
var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
material1.transparent = true;

var vignette = new THREE.Mesh(vignette_geo, material1)
vignette.rotateX( - Math.PI / 2 );
vignette.position.set(0,-100, 1500);
scene.add(vignette);
// リサイズへの対応
window.addEventListener('resize', function(){
    renderer.setSize( 
      document.getElementsByClassName( 'hero' )[0].offsetWidth, 
      document.getElementsByClassName( 'hero' )[0].offsetHeight
    );
 
    camera.aspect = document.getElementsByClassName( 'hero' )[0].offsetWidth / document.getElementsByClassName( 'hero' )[0].offsetHeight;
    camera.updateProjectionMatrix();
}, false);

controls = new THREE.OrbitControls( camera, renderer.domElement );
//controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

var render = function () {
  requestAnimationFrame( render );
  controls.update();
  water_uniforms.time.value += .00125;
  metal_uniforms.time.value += .000125;
  groundMirror.render();
  renderer.render( scene, camera );
};

render();
// DOMを追加
document.getElementsByClassName( 'hero' )[0].innerHTML = '';
document.getElementsByClassName( 'hero' )[0].appendChild( renderer.domElement );