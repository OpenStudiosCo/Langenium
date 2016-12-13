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
var offRenderTarget1 = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
    }
);

// Live2Dモデルパス
var MODEL_PATH1 = "/universe/art/concept-art/Canon/Character%20models/";
var MODEL_JSON1 = "jack.model.json";
// Live2Dモデル生成
var live2dmodel1 = new THREE.Live2DRender( renderer, MODEL_PATH1, MODEL_JSON1 );

// オフスクリーンを描画するPlane生成
var geometry = new THREE.PlaneGeometry( 6, 6, 1, 1 );
// レンダーテクスチャをテクスチャにする
var material = new THREE.MeshBasicMaterial( { map:offRenderTarget1.texture } );
var plane = new THREE.Mesh( geometry, material );
// この1行がないと透過部分が抜けない
plane.material.transparent = true;
plane.position.set(0, 0, -1);
scene.add( plane );

// ライト
var directionalLight = new THREE.DirectionalLight('#11aaff', 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

var directionalLight2 = new THREE.DirectionalLight('#11aaff', 1);
directionalLight2.position.set(0, 10, -10);
scene.add(directionalLight2);

// キューブ
var geometry1 = new THREE.BoxGeometry(10,10,10);
var material1 = new THREE.MeshLambertMaterial( { color: 0xCCCCCC, side: THREE.BackSide } );
var cube = new THREE.Mesh( geometry1, material1 );
cube.position.set(0, -1, 0);
scene.add( cube );

var cube2 = new THREE.Mesh( geometry1, material1 );
cube2.position.set(0, -1, 0);
scene.add( cube2 );

// リサイズへの対応
window.addEventListener('resize', function(){
    renderer.setSize( window.innerWidth, window.innerHeight );
    // オフスクリーンのレンダーターゲットもリサイズ
    offRenderTarget1.setSize( window.innerWidth, window.innerHeight );
    // マウスドラッグ座標もリサイズ
    live2dmodel1.setMouseView(renderer);
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
var time = 0;
var render = function () {
    time += 1;
    requestAnimationFrame( render );
    cube.rotation.x += 0.01;
    cube.rotation.z += 0.01;
    //cube.rotation.y += 0.01;
    
    cube2.rotation.x -= 0.01;
    cube2.rotation.z -= 0.01;
    //cube2.rotation.y -= 0.01;

    // オフスクリーン切り替え描画
    renderer.render( offScene1, camera, offRenderTarget1 );

    // オフスクリーンにLive2D描画
    live2dmodel1.draw();
    // resetGLStateしないとgl.useProgramが呼ばれず以下のエラーになる
    // [error]location is not from current program
    renderer.resetGLState();
    // Mainシーンで描画
    renderer.render( scene, camera );
};

render();