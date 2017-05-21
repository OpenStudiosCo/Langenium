var container, stats;
var camera, scene, renderer;
var sphere;
var ratio = window.innerWidth/window.innerHeight;
var parameters = {
  width: 2000,
  height: 2000,
  widthSegments: 250,
  heightSegments: 250,
  depth: 1500,
  param: 4,
  filterparam: 1
};

var waterNormals;

init();
animate();

function init() {
// レンダラーのサイズ指定
renderer = new THREE.WebGLRenderer();
renderer.setSize( 
  document.getElementsByClassName( 'ocean_scene' )[0].offsetWidth, 
  (
    (document.getElementsByClassName( 'ocean_scene' )[0].offsetHeight > 400)
    ? document.getElementsByClassName( 'ocean_scene' )[0].offsetHeight
    : document.getElementsByClassName( 'ocean_scene' )[0].offsetWidth / ratio
  )
);
// DOMを追加
document.getElementsByClassName( 'ocean_scene' )[0].appendChild( renderer.domElement );
container = document.getElementsByClassName( 'ocean_scene' )[0];
  //

  scene = new THREE.Scene();
  //scene.fog = new THREE.FogExp2( 0xaabbbb, 0.0001 );

  //

  camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.5, 3000000 );
  camera.position.set( 2000, 750, 2000 );

  //

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enablePan = false;
  controls.minDistance = 1000.0;
  controls.maxDistance = 5000.0;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set( 0, 500, 0 );

  scene.add( new THREE.AmbientLight( 0x444444 ) );

  //

  var light = new THREE.DirectionalLight( 0xffffbb, 1 );
  light.position.set( - 1, 1, - 1 );
  scene.add( light );

  //

  waterNormals = new THREE.TextureLoader().load( '/vendor/threejs/examples/textures/waternormals.jpg' );
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

  water = new THREE.Water( renderer, camera, scene, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: waterNormals,
    alpha:  1.0,
    sunDirection: light.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 50.0,
    fog: scene.fog != undefined
  } );


  mirrorMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( parameters.width * 500, parameters.height * 500 ),
    water.material
  );

  mirrorMesh.add( water );
  mirrorMesh.rotation.x = - Math.PI * 0.5;
  scene.add( mirrorMesh );

  // skybox

  var cubeMap = new THREE.CubeTexture( [] );
  cubeMap.format = THREE.RGBFormat;

  var loader = new THREE.ImageLoader();
  loader.load( '/vendor/threejs/examples/textures/skyboxsun25degtest.png', function ( image ) {

    var getSide = function ( x, y ) {

      var size = 1024;

      var canvas = document.createElement( 'canvas' );
      canvas.width = size;
      canvas.height = size;

      var context = canvas.getContext( '2d' );
      context.drawImage( image, - x * size, - y * size );

      return canvas;

    };

    cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
    cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
    cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
    cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
    cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
    cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
    cubeMap.needsUpdate = true;

  } );

  var cubeShader = THREE.ShaderLib[ 'cube' ];
  cubeShader.uniforms[ 'tCube' ].value = cubeMap;

  var skyBoxMaterial = new THREE.ShaderMaterial( {
    fragmentShader: cubeShader.fragmentShader,
    vertexShader: cubeShader.vertexShader,
    uniforms: cubeShader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
  } );

  var skyBox = new THREE.Mesh(
    new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
    skyBoxMaterial
  );

  scene.add( skyBox );

  //

  var geometry = new THREE.IcosahedronGeometry( 400, 4 );

  for ( var i = 0, j = geometry.faces.length; i < j; i ++ ) {

    geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );

  }

  var material = new THREE.MeshPhongMaterial( {
    vertexColors: THREE.FaceColors,
    shininess: 100,
    envMap: cubeMap
  } );

  sphere = new THREE.Mesh( geometry, material );
  scene.add( sphere );

  //

  stats = new Stats();
  container.appendChild( stats.dom );

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
    ratio =  window.innerWidth / window.innerHeight;
    camera.aspect = ratio;
    camera.updateProjectionMatrix();
    renderer.setSize( 
      document.getElementsByClassName( 'ocean_scene' )[0].offsetWidth, 
      (
        (document.getElementsByClassName( 'ocean_scene' )[0].offsetHeight > 400)
        ? document.getElementsByClassName( 'ocean_scene' )[0].offsetHeight
        : document.getElementsByClassName( 'ocean_scene' )[0].offsetWidth / ratio
      )
    );
}

//

function animate() {

  requestAnimationFrame( animate );
  render();
  stats.update();

}

function render() {

  var time = performance.now() * 0.001;

  sphere.position.y = Math.sin( time ) * 500 + 250;
  sphere.rotation.x = time * 0.5;
  sphere.rotation.z = time * 0.51;

  water.material.uniforms.time.value += 1.0 / 60.0;
  controls.update();
  water.render();
  renderer.render( scene, camera );

}