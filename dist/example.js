// シーン生成
var scene = new THREE.Scene();
// カメラ生成
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

// レンダラー生成
var renderer = new THREE.WebGLRenderer();
// レンダラーのサイズ指定
renderer.setSize( window.innerWidth, window.innerHeight );
// DOMを追加
document.getElementsByClassName( 'hero' )[0].appendChild( renderer.domElement );

// オフスクリーン用(Live2Dを描画)
var offScene1 = new THREE.Scene();
var offScene2 = new THREE.Scene();
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

// Live2Dモデルパス
var MODEL_PATH1 = "/old/src/vendor/live2d-sdk/sample/jack/assets/jack/";
var MODEL_JSON1 = "jack.model.json";
var MODEL_JSON2 = "jack-back.model.json";

// Live2Dモデル生成
var live2dmodel1 = new THREE.Live2DRender( renderer, MODEL_PATH1, MODEL_JSON1 );
var live2dmodel2 = new THREE.Live2DRender( renderer, MODEL_PATH1, MODEL_JSON2 );

// オフスクリーンを描画するPlane生成
var geometry = new THREE.PlaneGeometry( 6, 6, 1, 1 );
// レンダーテクスチャをテクスチャにする
var material = new THREE.MeshBasicMaterial( { map:offRenderTarget1.texture } );
var plane = new THREE.Mesh( geometry, material );
// この1行がないと透過部分が抜けない
plane.material.transparent = true;
plane.position.set(-1, 0, -1);
scene.add( plane );

// レンダーテクスチャをテクスチャにする
var geometry2 = new THREE.PlaneGeometry( 6, 6, 1, 1 );
var material2 = new THREE.MeshBasicMaterial( { map:offRenderTarget2.texture } );
var plane2 = new THREE.Mesh( geometry2, material2 );
// この1行がないと透過部分が抜けない
plane2.material.transparent = true;
plane2.position.set(1, 0, -1);
scene.add( plane2 );

// ライト
var directionalLight = new THREE.DirectionalLight('#FFFFFF', 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

var directionalLight2 = new THREE.DirectionalLight('#FFFFFF', 1);
directionalLight2.position.set(0, 10, -10);
scene.add(directionalLight2);

// キューブ
var geometry1 = new THREE.BoxGeometry(20,20,20);
var material1 = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, side: THREE.BackSide } );
var cube = new THREE.Mesh( geometry1, material1 );
cube.position.set(0, -1, -10);
scene.add( cube );

var cube2 = new THREE.Mesh( geometry1, material1 );
cube2.position.set(0, -1, -10);
scene.add( cube2 );


var material2 = new THREE.MeshLambertMaterial( { color: 0x11CCFF } );
var sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 20, 10), material2);
sphere.position.set(0, -1, -10);
scene.add(sphere);

// リサイズへの対応
window.addEventListener('resize', function(){
    renderer.setSize( window.innerWidth, window.innerHeight );
    // オフスクリーンのレンダーターゲットもリサイズ
    offRenderTarget1.setSize( window.innerWidth, window.innerHeight );
    offRenderTarget2.setSize( window.innerWidth, window.innerHeight );
    // マウスドラッグ座標もリサイズ
    live2dmodel1.setMouseView(renderer);
    live2dmodel2.setMouseView(renderer);
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
    cube.position.x = ( Math.cos( timer ) * 10 );
    cube.position.y = ( Math.sin( timer ) * 10 );
    cube.rotateX(Math.sin(timer) / 100);
    cube.rotateZ(Math.sin(timer) / 100);
    cube2.position.x = ( Math.cos( -timer ) * 10 );
    cube2.position.y = ( Math.sin( -timer ) * 10 );
    cube2.rotateX(Math.sin(-timer) / 100);
    cube2.rotateZ(Math.sin(-timer) / 100);

    sphere.position.x = ( Math.cos( -timer ) * 10 );

    // オフスクリーン切り替え描画
    renderer.render( offScene1, camera, offRenderTarget1 );
    
    live2dmodel1.draw();

    renderer.render( offScene2, camera, offRenderTarget2 );

    live2dmodel2.draw();
    // resetGLStateしないとgl.useProgramが呼ばれず以下のエラーになる
    // [error]location is not from current program
    renderer.resetGLState();
    // Mainシーンで描画
    renderer.render( scene, camera );
};

render();