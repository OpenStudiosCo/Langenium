/**
*  Sample.js
*
*  You can modify and use this source freely
*  only for the development of application related Live2D.
*
*  (c) Live2D Inc. All rights reserved.
*/

// JavaScriptで発生したエラーを取得
window.onerror = function(msg, url, line, col, error) {
    var errmsg = "file:" + url + "<br>line:" + line + " " + msg;
    Simple.myerror(errmsg);
}

function Simple(canvas, canvasId, no) {
    /*
    * Live2Dモデルのインスタンス
    */
    this.live2DModel = null;

    /*
    * アニメーションを停止するためのID
    */
    this.requestID = null;

    /*
    * モデルのロードが完了したら true
    */
    this.loadLive2DCompleted = false;

    /*
    * モデルの初期化が完了したら true
    */
    this.initLive2DCompleted = false;

    /*
    * WebGL Image型オブジェクトの配列
    */
    this.loadedImages = [];

    this.canvasId = canvasId;
    this.glno = no;
    /*
    * Live2D モデル設定。
    */

    // haru2.0モデル
    // this.modelDef = {
    //     "type":"Live2D Model Setting",
    //     "name":"haru",
    //     "model":"assets/haru/haru.moc",
    //     "textures":[
    //         "assets/haru/haru.1024/texture_00.png",
    //         "assets/haru/haru.1024/texture_01.png",
    //         "assets/haru/haru.1024/texture_02.png"
    //     ]
    // };

    // Epsilon2.1モデル
    this.modelDef = {
        "type":"Live2D Model Setting",
        "name":"Epsilon2.1",
        "model":"assets/Epsilon2.1/Epsilon2.1.moc",
        "textures":[
            "assets/Epsilon2.1/Epsilon2.1.2048/texture_00.png",
        ]
    };

    var thisRef = this;

    // コンテキストを失った時
    canvas.addEventListener("webglcontextlost", function(e){
        Simple.myerror("context lost");
        thisRef.loadLive2DCompleted = false;
        thisRef.initLive2DCompleted = false;

        var cancelAnimationFrame =
                window.cancelAnimationFrame ||
                window.mozCancelAnimationFrame;
        cancelAnimationFrame(thisRef.requestID);
    }, false);
    // コンテキストが復元されたとき
    canvas.addEventListener("webglcontextrestored", function(e){
       Simple.myerror("webcontext restored");
       Simple.initLoop(canvas);       
    }, false);

    this.initLoop(canvas);
}

/*
* WebGLコンテキストを取得・初期化。
* Live2Dの初期化、描画ループを開始。
*/
Simple.prototype.initLoop = function(canvas/* HTML5 canvasオブジェクト */)
{

    var thisRef = this;
    // ------------ WebGLの初期化 ------------

    // WebGLのコンテキストを取得する
    var gl = this.getWebGLContext(canvas);
    if (!gl) {
        Simple.myerror("Failed to create WebGL context.");
        return;
    }

    // Live2Dの初期化
    Live2D.init();

    // ------------ Live2Dの初期化 ------------

    // mocファイルからLive2Dモデルのインスタンスを生成
    this.loadBytes(this.modelDef.model, function(buf){
        // OpenGLのコンテキストをセット(MultiCanvasの場合はここでglをセットする)
        Live2D.setGL(gl, thisRef.glno);
        thisRef.live2DModel = Live2DModelWebGL.loadModel(buf, thisRef.glno);
    });

    // テクスチャの読み込み
    var loadCount = 0;
    for(var i = 0; i < this.modelDef.textures.length; i++){
        (function ( tno ){    // 即時関数で i の値を tno に固定する（onerror用)
            thisRef.loadedImages[tno] = new Image();
            thisRef.loadedImages[tno].src = thisRef.modelDef.textures[tno];
            thisRef.loadedImages[tno].onload = function(){
                if((++loadCount) == thisRef.modelDef.textures.length) {
                    thisRef.loadLive2DCompleted = true; //全て読み終わった
                }
            }
            thisRef.loadedImages[tno].onerror = function() {
                Simple.myerror("Failed to load image : " + thisRef.modelDef.textures[tno]);
            }
        })( i );
    }

    //------------ 描画ループ ------------

    (function tick() {
        thisRef.draw(gl); // 1回分描画

        var requestAnimationFrame =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;
        requestID = requestAnimationFrame( tick , canvas );   // 一定時間後に自身を呼び出す
    })();
};


Simple.prototype.draw = function(gl/* WebGLコンテキスト */)
{
    // 描画エリアをクリア
    gl.clearColor( 0.0 , 0.0 , 0.0 , 0.0 );
    // Canvasをクリアする
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Live2D初期化
    if( ! this.live2DModel || ! this.loadLive2DCompleted )
        return; //ロードが完了していないので何もしないで返る

    // ロード完了後に初回のみ初期化する
    if( ! this.initLive2DCompleted ){
        this.initLive2DCompleted = true;

        // 画像からWebGLテクスチャを生成し、モデルに登録
        for( var i = 0; i < this.loadedImages.length; i++ ){
            // Image型オブジェクトからテクスチャを生成
            var texName = this.createTexture(gl, this.loadedImages[i], this.live2DModel);

            this.live2DModel.setTexture(i, texName); // モデルにテクスチャをセット
        }

        // テクスチャの元画像の参照をクリア
        this.loadedImages = null;

        // 表示位置を指定するための行列を定義する
        var s = 2.0 / this.live2DModel.getCanvasWidth(); // canvasの横幅を-1..1区間に収める
        var matrix4x4 = [
             s, 0, 0, 0,
             0,-s, 0, 0,
             0, 0, 1, 0,
            -1, 1, 0, 1
        ];
        this.live2DModel.setMatrix(matrix4x4);
    }

    // キャラクターのパラメータを適当に更新
    var t = UtSystem.getUserTimeMSec() * 0.001 * 2 * Math.PI; //1秒ごとに2π(1周期)増える
    var cycle = 3.0; // パラメータが一周する時間(秒)
    // PARAM_ANGLE_Xのパラメータが[cycle]秒ごとに-30から30まで変化する
    this.live2DModel.setParamFloat("PARAM_ANGLE_X", 30 * Math.sin(t/cycle));
    this.live2DModel.setParamFloat("PARAM_EYE_R_OPEN", 1 * Math.sin(t/cycle));
    this.live2DModel.setParamFloat("PARAM_EYE_L_OPEN", 1 * Math.sin(t/cycle));

    // Live2Dモデルを更新して描画
    this.live2DModel.update(); // 現在のパラメータに合わせて頂点等を計算
    this.live2DModel.draw();	// 描画
};


/*
* WebGLのコンテキストを取得する
*/
Simple.prototype.getWebGLContext = function(canvas/* HTML5 canvasオブジェクト */)
{
    var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];

    var param = {
        alpha : true,
        premultipliedAlpha : true
    };

    for( var i = 0; i < NAMES.length; i++ ){
        try{
            var ctx = canvas.getContext( NAMES[i], param );
            if( ctx ) return ctx;
        }
        catch(e){}
    }

    return null;
};


/*
* Image型オブジェクトからテクスチャを生成
*/
Simple.prototype.createTexture = function(gl/* WebGLコンテキスト */, image/* WebGL Image */, live2DModel)
{
    var texture = gl.createTexture(); //テクスチャオブジェクトを作成する
    if ( !texture ){
        mylog("Failed to generate gl texture name.");
        return -1;
    }

    if(live2DModel.isPremultipliedAlpha() == false) {
        // 乗算済アルファテクスチャ以外の場合
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);	// imageを上下反転
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D , texture );
    gl.texImage2D( gl.TEXTURE_2D , 0 , gl.RGBA , gl.RGBA , gl.UNSIGNED_BYTE , image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture( gl.TEXTURE_2D , null );

    return texture;
};


/*
* ファイルをバイト配列としてロードする
*/
Simple.prototype.loadBytes = function(path , callback)
{
    var request = new XMLHttpRequest();
    request.open("GET", path , true);
    request.responseType = "arraybuffer";
    request.onload = function(){
        switch( request.status ){
        case 200:
            callback( request.response );
            break;
        default:
            Simple.myerror( "Failed to load (" + request.status + ") : " + path );
            break;
        }
    }
    request.send(null);
    return request;
};

/*
* アニメーションをキャンセルする
*/
Simple.prototype.cancelAnimation = function()
{
    var thisRef = this;
    thisRef.loadLive2DCompleted = false;
    thisRef.initLive2DCompleted = false;

    var cancelAnimationFrame =
            window.cancelAnimationFrame ||
            window.mozCancelAnimationFrame;
    cancelAnimationFrame(thisRef.requestID);    
};


/*
* 画面ログを出力
*/
Simple.mylog = function(msg/* string */)
{
    var myconsole = document.getElementById("myconsole");
    myconsole.innerHTML = myconsole.innerHTML + "<br>" + msg;
    console.log(msg);
};

/*
* 画面エラーを出力
*/
Simple.myerror = function(msg/* string */)
{
    Simple.mylog( "<span style='color:red'>" + msg + "</span>");
};