// シーン生成
var scene = new THREE.Scene();
// カメラ生成
var ratio = window.innerWidth/window.innerHeight;

var camera = new THREE.PerspectiveCamera( 35, ratio , 0.1, 100000 );
camera.position.z = 2000;

// レンダラー生
var renderer = new THREE.WebGLRenderer();
// レンダラーのサイズ指定
renderer.setSize( 
  document.getElementsByClassName( 'hero' )[0].offsetWidth, 
  document.getElementsByClassName( 'hero' )[0].offsetWidth / ratio
);

// ライト
var directionalLight = new THREE.DirectionalLight('#FFFFFF', 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

var directionalLight2 = new THREE.DirectionalLight('#FFFFFF', 1);
directionalLight2.position.set(0, 10, -10);
scene.add(directionalLight2);

var platform_loader = new THREE.JSONLoader();

var material11 = new THREE.MeshLambertMaterial( { color: 0xFF0000, transparent: true, opacity: 0.5 } );
var material22 = new THREE.MeshLambertMaterial( { color: 0x0000FF, transparent: true, opacity: 0.5 } );

var platform;
var cb = function(platform_geometry, platform_materials) {
  for (var i = 0; i < platform_materials.length; i++) {
    if(platform_materials[i].name == 'Dark-Glass' || platform_materials[i].name == 'Red-Metal') {
      platform_materials[i].color = new THREE.Color(0xFF0000);
      platform_materials[i].transparent = true;
      platform_materials[i].opacity = 0.5;
    }
    if (platform_materials[i].name == 'Metal' || platform_materials[i].name == 'Light-Metal') {
      platform_materials[i] = material22;
    }
  }

  platform = new THREE.Mesh(platform_geometry,  platform_materials);
  platform.scale.set(200,200,200);
  platform.position.set(0,-370,0);
  
  scene.add(platform);
  render();   
}
platform_loader.load('/universe/art/design/models/union-platform2.json', function(platform_geometry, platform_materials) {
  cb(platform_geometry, platform_materials);
});

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
  platform.geometry.uvsNeedUpdate = true;
  controls.update();
  renderer.render( scene, camera );
};


// DOMを追加
document.getElementsByClassName( 'hero' )[0].innerHTML = '';
document.getElementsByClassName( 'hero' )[0].appendChild( renderer.domElement );