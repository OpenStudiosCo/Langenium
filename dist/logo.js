// シーン生成
var logo_scene = new THREE.Scene();
// カメラ生成
var logo_camera = new THREE.PerspectiveCamera( 45, document.getElementsByClassName( 'logo' )[0].offsetWidth/document.getElementsByClassName( 'logo' )[0].offsetHeight, 0.1, 100000 );
logo_camera.position.z = 2300;

// レンダラー生
var logo_renderer = new THREE.WebGLRenderer();
// レンダラーのサイズ指定
logo_renderer.setSize( 
  document.getElementsByClassName( 'logo' )[0].offsetWidth, 
  document.getElementsByClassName( 'logo' )[0].offsetHeight
);
// DOMを追加
document.getElementsByClassName( 'logo' )[0].innerHTML = '';
document.getElementsByClassName( 'logo' )[0].appendChild( logo_renderer.domElement );

var loader = new THREE.JSONLoader();

var noiseTexture3 = new THREE.TextureLoader().load( "/old/res/textures/noise3.jpg" );
noiseTexture3.wrapS = noiseTexture3.wrapT = THREE.RepeatWrapping;

var logo_water_uniforms = {
  noiseTexture: { type: "t", value: noiseTexture3 },
  time:       { type: "f", value: 1.0 }
},
logo_metal_uniforms = {
  noiseTexture: { type: "t", value: noiseTexture3 },
  time:       { type: "f", value: 0.0 }
};

var logoWaterMaterial = new THREE.ShaderMaterial( 
{
    uniforms: logo_water_uniforms,
    vertexShader:   document.getElementById( 'logoWaterVertShader'   ).textContent,
    fragmentShader: document.getElementById( 'logoWaterFragShader' ).textContent,
    side: THREE.DoubleSide
}   );

var logoMetalMaterial = new THREE.ShaderMaterial( 
{
    uniforms: logo_metal_uniforms,
  vertexShader:   document.getElementById( 'logoMetalVertShader'   ).textContent,
  fragmentShader: document.getElementById( 'logoMetalFragShader' ).textContent,
  side: THREE.DoubleSide
}   );

var mesh;
var logo_cb = function(geometry, materials) {
    
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
  mesh.position.set(0,250,0);
  mesh.rotateX( Math.PI / 2 );
  logo_scene.add(mesh);     
}

loader.load('/old/res/models/langenium-logo.js', function(geometry, materials) {
  logo_cb(geometry, materials);
});

var planeGeo = new THREE.PlaneGeometry( 6000,6000 );
// MIRROR planes
groundMirror = new THREE.Mirror( logo_renderer, logo_camera, { clipBias: 0.003, textureWidth: 600, textureHeight: 600, color: 0x777777 } );

var mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
mirrorMesh.add( groundMirror );
mirrorMesh.rotateX( - Math.PI / 2 );
mirrorMesh.position.set(0, -200,0);
logo_scene.add( mirrorMesh );

var vignette_geo = new THREE.PlaneGeometry( 6000,6000 );
// create a canvas element
var canvas1 = document.createElement('canvas');
var context1 = canvas1.getContext('2d');
var my_gradient=context1.createLinearGradient(0,0,0,170);
my_gradient.addColorStop(0.2, 'rgba(0,0,0,0)');
my_gradient.addColorStop(0.6,  'rgba(0,0,0,1)');
context1.fillStyle=my_gradient;
context1.fillRect(0,0,canvas1.width,canvas1.height);
  
// canvas contents will be used for a texture
var texture1 = new THREE.Texture(canvas1) 
texture1.needsUpdate = true;
    
var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
material1.transparent = true;

var vignette = new THREE.Mesh(vignette_geo, material1)
vignette.rotateX( - Math.PI / 2 );
vignette.position.set(0,-150, 1500);
logo_scene.add(vignette);
// リサイズへの対応
window.addEventListener('resize', function(){
    logo_renderer.setSize( 
      document.getElementsByClassName( 'logo' )[0].offsetWidth, 
      document.getElementsByClassName( 'logo' )[0].offsetHeight
    );
 
    logo_camera.aspect = document.getElementsByClassName( 'logo' )[0].offsetWidth / document.getElementsByClassName( 'logo' )[0].offsetHeight;
    logo_camera.updateProjectionMatrix();
}, false);


var logo_render = function () {
  requestAnimationFrame( logo_render );
  logo_water_uniforms.time.value += .0005;
  groundMirror.render();
  logo_renderer.render( logo_scene, logo_camera );
};

logo_render();