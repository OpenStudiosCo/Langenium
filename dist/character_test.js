// シーン生成
var scene = new THREE.Scene();
// カメラ生成
var ratio = window.innerWidth/window.innerHeight;
var camera = new THREE.PerspectiveCamera( 35, ratio, 0.1, 1000 );
camera.position.z = 10;

// レンダラー生成
var renderer = new THREE.WebGLRenderer();
// レンダラーのサイズ指定
renderer.setSize( 
  document.getElementsByClassName( 'character_test' )[0].offsetWidth, 
  (
    (document.getElementsByClassName( 'character_test' )[0].offsetHeight > 400)
    ? document.getElementsByClassName( 'character_test' )[0].offsetHeight
    : document.getElementsByClassName( 'character_test' )[0].offsetWidth / ratio
  )
);
// DOMを追加
document.getElementsByClassName( 'character_test' )[0].appendChild( renderer.domElement );

controls = new THREE.OrbitControls( camera, renderer.domElement );
//controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.minPolarAngle = Math.PI/2;
controls.maxPolarAngle = Math.PI/2;

// オフスクリーン用(Live2Dを描画)
var offScene1 = new THREE.Scene();
var offScene2 = new THREE.Scene();
var offScene3 = new THREE.Scene();
var offScene4 = new THREE.Scene();
var offRenderTarget1 = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
    }
);

var offRenderTarget2 = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
    }
);

var offRenderTarget3 = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
    }
);

var offRenderTarget4 = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
    }
);

// Live2Dモデルパス
var MODEL_PATH1 = "/universe/art/production/models/";
var MODEL_JSON1 = "jack.model.json";
var MODEL_JSON2 = "jack-back.model.json";
var MODEL_JSON3 = "jack-side-left.model.json";
var MODEL_JSON4 = "jack-side-right.model.json";


// Live2Dモデル生成
var live2dmodel1 = new THREE.Live2DRender( renderer, MODEL_PATH1, MODEL_JSON1 );
var live2dmodel2 = new THREE.Live2DRender( renderer, MODEL_PATH1, MODEL_JSON2 );
var live2dmodel3 = new THREE.Live2DRender( renderer, MODEL_PATH1, MODEL_JSON3 );
var live2dmodel4 = new THREE.Live2DRender( renderer, MODEL_PATH1, MODEL_JSON4 );

var geometry = new THREE.PlaneGeometry(6,6,1,1);
var material = new THREE.MeshBasicMaterial( { map:offRenderTarget1.texture, side: THREE.DoubleSide, alphaTest: 0.5  } );
var plane = new THREE.Mesh( geometry, material );
//plane.scale.set(6,6);
plane.material.transparent = true;
scene.add( plane );

var geometry2 = new THREE.PlaneGeometry(6,6,1,1);
var material2 = new THREE.MeshBasicMaterial( { map:offRenderTarget2.texture, side: THREE.DoubleSide, alphaTest: 0.5  } );
var plane2 = new THREE.Mesh( geometry2, material2 );
//plane2.scale.set(6,6);
plane2.material.transparent = true;
scene.add( plane2 );

var geometry3 = new THREE.PlaneGeometry(6,6,1,1);
var material3 = new THREE.MeshBasicMaterial( { map:offRenderTarget3.texture, side: THREE.DoubleSide, alphaTest: 0.5  } );
var plane3 = new THREE.Mesh( geometry3, material3 );
//plane3.scale.set(6,6);
plane3.material.transparent = true;
scene.add( plane3 );

var geometry4 = new THREE.PlaneGeometry(6,6,1,1);
var material4 = new THREE.MeshBasicMaterial( { map:offRenderTarget4.texture, side: THREE.DoubleSide, alphaTest: 0.5  } );
material4.map.repeat.set(-1, 1);
material4.map.offset.set(1, 0);
var plane4 = new THREE.Mesh( geometry4, material4 );
//plane4.scale.set(-6,-6);
plane4.material.transparent = true;
scene.add( plane4 );

var origin = new THREE.Vector3(0,3,-1);
var arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,2), origin, 2, 0xFFCC00);

scene.add(arrow);

// ライト
var directionalLight = new THREE.DirectionalLight('#FFFFFF', 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

var directionalLight2 = new THREE.DirectionalLight('#FFFFFF', 1);
directionalLight2.position.set(0, 10, -10);
scene.add(directionalLight2);

var material2 = new THREE.MeshLambertMaterial( { color: 0x11CCFF, transparent: true, opacity: 0.5 } );
var sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 20, 10), material2);
sphere.position.set(0, -1, -10);
scene.add(sphere);

var waterNormals = new THREE.TextureLoader().load('/vendor/ocean/assets/img/waternormals.jpg');
waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 

// Create the water effect
var ms_Water = new THREE.Water(renderer, camera, scene, {
    textureWidth: 256,
    textureHeight: 256,
    waterNormals: waterNormals,
    alpha:  1.0,
    sunDirection: directionalLight.position.normalize(),
    sunColor: 0xffffff,
    waterColor: 0x11aaFF,
    betaVersion: 0,
    side: THREE.DoubleSide
});
var aMeshMirror = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20, 20, 10, 10), 
    this.ms_Water.material
);
aMeshMirror.add(this.ms_Water);
aMeshMirror.rotation.x = - Math.PI * 0.5;
aMeshMirror.position.set(0, -3, 0);

scene.add(aMeshMirror);

// リサイズへの対応
window.addEventListener('resize', function(){
    renderer.setSize( window.innerWidth, window.innerHeight );
    // オフスクリーンのレンダーターゲットもリサイズ
    offRenderTarget1.setSize( window.innerWidth, window.innerHeight );
    offRenderTarget2.setSize( window.innerWidth, window.innerHeight );
    offRenderTarget3.setSize( window.innerWidth, window.innerHeight );
    offRenderTarget4.setSize( window.innerWidth, window.innerHeight );
    // マウスドラッグ座標もリサイズ
    live2dmodel1.setMouseView(renderer);
    live2dmodel2.setMouseView(renderer);
    live2dmodel3.setMouseView(renderer);
    live2dmodel4.setMouseView(renderer);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}, false);

// コンテキストメニューの表示を阻止
document.addEventListener('contextmenu', function(e){
    // 右クリックの挙動を阻止する
    e.preventDefault();    
}, false);

// マウスクリック処理
document.addEventListener('mousedown', function(e){
    switch(e.button){
        case 0: // 左クリック
            // ランダムモーション指定
           // live2dmodel1.setRandomMotion();
            // 特定のモーション指定は、setMotion("ファイル名")を使う。
            // 例：live2dmodel.setMotion("Epsilon2.1_m_08.mtn");
            break;
        case 2: // 右クリック
            // ランダム表情切り替え
            //live2dmodel1.setRandomExpression();
            // 特定の表情切り替えは、setExpression("ファイル名")を使う。
            // 例：live2dmodel.setExpression("f04.exp.json");
            break;            
    }
});


/**
 * 描画処理
 */
var render = function () {
    requestAnimationFrame( render );

    var timer = Date.now() * 0.001;    

    sphere.position.x = ( Math.cos( -timer ) * 10 );
    sphere.position.y = ( Math.sin( -timer ) * 10 );

    ms_Water.material.uniforms.time.value += 1.0 / 60.0;

    plane.lookAt(camera.position);
    plane2.lookAt(camera.position);
    plane3.lookAt(camera.position);
    plane4.lookAt(camera.position);

    // オフスクリーン切り替え描画
    renderer.render( offScene1, camera, offRenderTarget1 );
    
    live2dmodel1.draw();

    renderer.render( offScene2, camera, offRenderTarget2 );

    live2dmodel2.draw();

    renderer.render( offScene3, camera, offRenderTarget3 );

    live2dmodel3.draw();

    renderer.render( offScene4, camera, offRenderTarget4 );

    live2dmodel4.draw();

    var camera_vector = new THREE.Vector3();
    camera_vector.setFromMatrixPosition( camera.matrixWorld );

    var diff = new THREE.Vector3().subVectors(plane.position, camera_vector).normalize();
 
    if (diff.z < 0.0 && 
        Math.abs(diff.x) < Math.abs(diff.z)) {
        // front
        plane.visible = true;
        plane2.visible = false;
        plane3.visible = false;
        plane4.visible = false;
    }
    if (diff.x > 0 &&
        Math.abs(diff.x) > Math.abs(diff.z)) {
        // right
        plane.visible = false;
        plane2.visible = false;
        plane3.visible = false;
        plane4.visible = true;
    }
    if (diff.x < 0 &&
        Math.abs(diff.x) > Math.abs(diff.z)) {
        // left
        plane.visible = false;
        plane2.visible = false;
        plane3.visible = true;
        plane4.visible = false;
    }
    if (diff.z > 0.0 && 
        Math.abs(diff.x) < Math.abs(diff.z)) {
        // back
        plane.visible = false;
        plane2.visible = true;
        plane3.visible = false;
        plane4.visible = false;
    }

    
    ms_Water.render();
    // resetGLStateしないとgl.useProgramが呼ばれず以下のエラーになる
    // [error]location is not from current program
    renderer.resetGLState();

    controls.update(); 

    // Mainシーンで描画
    renderer.render( scene, camera );
};

render();