/*
 * Taken from https://github.com/naotaro0123/Live2D_ThreeJS/blob/master/Live2D/Live2DRender.js
 *
 * Comments from original author translated using Google Translate (translate.google.com)
 *
 * Live2D rendering class
 */
THREE.Live2DRender = function(renderer, filepath, filenm, scale) {
    // WebGL ContextのWebGLRenderer
    if(renderer){
        this.gl = renderer.getContext();
    }else{
        console.error("Pass renderer as the first argument");
        return;
    }
    // Model file path
    if(filepath){
        this.filepath = filepath;
    }else{
        console.error("Pass FilePath as the second argument");
        return;
    }
    // Json file name
    if(filenm){
        this.filenm = filenm;
    }else{
        console.error("Pass the file name as the third argument");
        return;
    }
    // Live2D model WebGL display size
    this.modelscale = scale || 2.0;

    // Instance of Live2D model
    this.live2DModel = null;
    // True if the model loading is complete
    this.loadLive2DCompleted = false;
    // True if model initialization is complete...
    this.initLive2DCompleted = false;
    // Array of WebGL Image type objects
    this.loadedImages = [];
    // Array of motions
    this.motions = [];
    // Motion management manager
    this.motionMgr = null;
    // Motion number
    this.motionnm = 0;
    // Motion Flag
    this.motionflg = false;
    // sound
    this.sounds = [];
    // Sound number
    this.soundnm = 0;
    // Sound before
    this.beforesound = 0;
    // Facial expression motion
    this.expressions = [];
    // Facial expression motion name
    this.expressionsnm = [];
    // Facial Motion Management Manager
    this.expressionManager = null;
    // Facial expression motion flag
    this.expressionflg = false;
    // Facial expression motion number
    this.expressionnm = 0;
    // Live2D model setting
    this.modelDef = null;
    // Fade-in
    this.fadeines = [];
    // Fade out
    this.fadeoutes = [];
    // Pause
    this.pose = null;
    // Physics operation
    this.physics = null;
    // Animation management by dragging
    this.dragMgr = null;        /*new L2DTargetPoint();*/
    this.viewMatrix = null;     /*new L2DViewMatrix();*/
    this.projMatrix = null;     /*new L2DMatrix44()*/
    this.deviceToScreen = null; /*new L2DMatrix44();*/
    this.drag = false;          // Whether it is being dragged or not
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.dragX      = 0;
    this.dragY      = 0;

    // Initialize Live2D
    Live2D.init();
    // Set OpenGL context
    Live2D.setGL(this.gl);
    // Instantiating a Live2D model management class
    this.live2DMgr = new LAppLive2DManager();
    // Load Json (set modelDef)
    this.loadJson();
    // Coordinate setting of mouse drag
    this.setMouseView(renderer);

    // Mouse drag event listener
    document.addEventListener("mousedown", this.mouseEvent.bind(this), false);
    document.addEventListener("mousemove", this.mouseEvent.bind(this), false);
    document.addEventListener("mouseup", this.mouseEvent.bind(this), false);
    document.addEventListener("mouseout", this.mouseEvent.bind(this), false);    
};

/*
 * Function of Live2D rendering class...
 */
THREE.Live2DRender.prototype = {

    /**
    * Get / initialize WebGL context.
    * Initialization of Live2D, start drawing loop.
    */
    initLoop : function()
    {
        //------------ Initialize Live2D ------------
        // For call back measures
        var that = this;
        // Generate instances of Live2D model from moc file
        this.loadBytes(that.filepath + that.modelDef.model, function(buf){
            that.live2DModel = Live2DModelWebGL.loadModel(buf);
        });

        /********** Load texture **********/
        var loadCount = 0;
        for(var i = 0; i < that.modelDef.textures.length; i++){
            (function ( tno ){// Fix i value to tno with immediate function (for onerror)
                that.loadedImages[tno] = new Image();
                that.loadedImages[tno].src = that.filepath + that.modelDef.textures[tno];
                that.loadedImages[tno].onload = function(){
                    if((++loadCount) == that.modelDef.textures.length) {
                        that.loadLive2DCompleted = true;//I finished reading everything.
                    }
                }
                that.loadedImages[tno].onerror = function() {
                    console.log("Failed to load image : " + that.modelDef.textures[tno]);
                }
            })( i );
        }

        /********** Load motion **********/
        var motion_keys = [];   // Motion key arrangement
        var mtn_tag = 0;        // Motion tag
        var mtn_num = 0;        // Motion count
        // keyを取得
        for(var key in that.modelDef.motions){
            // Get key under motions
            motion_keys[mtn_tag] = key;
            // Get the number of motion files to load
            mtn_num += that.modelDef.motions[motion_keys[mtn_tag]].length;
            mtn_tag++;
        }
        // Motion tag minute loop
        for(var mtnkey in motion_keys){
            // Load motion and sound (load tag under motions)
            for(var j = 0; j < that.modelDef.motions[motion_keys[mtnkey]].length; j++){
                // Load as many as motion
                that.loadBytes(that.filepath + that.modelDef.motions[motion_keys[mtnkey]][j].file, function(buf){
                    that.motions.push(Live2DMotion.loadMotion(buf));
                });
                // Load as many sounds as you want
                if(that.modelDef.motions[motion_keys[mtnkey]][j].sound == null){
                    that.sounds.push("");
                }else{
                    that.sounds.push(new L2DSound(that.filepath + that.modelDef.motions[motion_keys[mtnkey]][j].sound));
                }
                // Fade-in
                if(that.modelDef.motions[motion_keys[mtnkey]][j].fade_in == null){
                    that.fadeines.push("");
                }else{
                    that.fadeines.push(that.modelDef.motions[motion_keys[mtnkey]][j].fade_in);
                }
                // Fade out
                if(that.modelDef.motions[motion_keys[mtnkey]][j].fade_out == null){
                    that.fadeoutes.push("");
                }else{
                    that.fadeoutes.push(that.modelDef.motions[motion_keys[mtnkey]][j].fade_out);
                }
            }
        }
        // Instantiation of motion manager
        that.motionMgr = new L2DMotionManager();

        /********** Loading facial motion **********/
        var expression_name = [];   // Array of facial motion names
        var expression_file = [];   // Array of facial motion file names

        // Loading facial expressions (check if there are expressions in json)
        if(that.modelDef.expressions !== void 0){
            for(var i = 0; i < that.modelDef.expressions.length; i++){
                // Obtain an array of facial motion names
                expression_name[i] = that.modelDef.expressions[i].name;
                expression_file[i] = that.filepath + that.modelDef.expressions[i].file;
                // Load expression file
                that.loadExpression(expression_name[i], expression_file[i]);
            }
        }
        // Facial expression motion manager instantiation
        that.expressionManager = new L2DMotionManager();

        // Pose loading (check if there is pose in json)
        if(that.modelDef.pose !== void 0){
            that.loadBytes(that.filepath + that.modelDef.pose, function(buf){
                // Loading Force Class
                that.pose = L2DPose.load(buf);
            });
        }

        // Load physical operation (check if there is physics in json)
        if(that.modelDef.physics !== void 0){
            that.loadBytes(that.filepath + that.modelDef.physics, function(buf){
                // Loading a physical operation class
                that.physics = L2DPhysics.load(buf);
            });
        }
    },
    
    /**
     * Drag coordinate axis of Live2D
     */
    setMouseView : function(renderer){
        // Initialization of 3D buffer
        var width  = renderer.getSize().width;
        var height = renderer.getSize().height;
        // View matrix
        var ratio  = height / width;
        var left   = -1.0;
        var right  =  1.0;
        var bottom = -ratio;
        var top    = ratio;

        // Class for dragging
        this.dragMgr = new L2DTargetPoint();
        // View coordinate class of Live2D
        this.viewMatrix = new L2DViewMatrix();

        // Scope of the screen corresponding to the device. 
        // The left end of X, the right end of X, the lower end of Y, the upper end of Y
        this.viewMatrix.setScreenRect(left, right, bottom, top);
        // Scope of the screen corresponding to the device. 
        // The left end of X, the right end of X, the lower end of Y, the upper end of Y
        this.viewMatrix.setMaxScreenRect(-2.0, 2.0, -2.0, 2.0);
        this.viewMatrix.setMaxScale(2.0);
        this.viewMatrix.setMinScale(0.8);

        // Live2D coordinate system class
        this.projMatrix = new L2DMatrix44();
        this.projMatrix.multScale(1, (width / height));

        // Screen transformation matrix for mouse
        this.deviceToScreen = new L2DMatrix44();
        this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
        this.deviceToScreen.multScale(2 / width, -2 / width);
    },
    
    /**
    * Drawing Live2D
    */
    draw : function()
    {
        // Live2D initialization
        if( ! this.live2DModel || ! this.loadLive2DCompleted )
            return; // Since loading is not completed, return without doing anything

        // Initialize only the first time after loading
        if( ! this.initLive2DCompleted ){
            this.initLive2DCompleted = true;

            // Create a WebGL texture from the image and register it in the model
            for( var i = 0; i < this.loadedImages.length; i++ ){
                // Generate texture from Image type object
                var texName = this.createTexture(this.gl, this.loadedImages[i]);

                this.live2DModel.setTexture(i, texName); // Set texture to model
            }

            // Clear reference of original image of texture
            this.loadedImages = null;

            // Define matrix to specify display position
            var s = this.modelscale / this.live2DModel.getCanvasWidth(); 
            // Keep the width of the canvas within the range of -1..1
            var matrix4x4 = [
                 s, 0, 0, 0,
                 0,-s, 0, 0,
                 0, 0, 1, 0,
                -this.modelscale/2, this.modelscale/2, 0, 1
            ];
            this.live2DModel.setMatrix(matrix4x4);
        }

        // In cases other than idle motion (judged by flag and priority)
        if(this.motionflg == true && this.motionMgr.getCurrentPriority() == 0){
            // Fade in settings
            this.motions[this.motionnm].setFadeIn(this.fadeines[this.motionnm]);
            // Set fade out
            this.motions[this.motionnm].setFadeOut(this.fadeoutes[this.motionnm]);
            // Play a higher priority than idle motion
            this.motionMgr.startMotion(this.motions[this.motionnm], 1);
            this.motionflg = false;
            // Audio files also play
            if(this.sounds[this.motionnm]){
                // Stop if there was previous voice
                if(this.sounds[this.beforesound] != ""){
                    this.sounds[this.beforesound].stop();
                }
                // Play audio
                this.sounds[this.motionnm].play();
                // Store so that it can be stopped halfway
                this.beforesound = this.motionnm;
            }
        }

        // Playing idle motion if motion is over
        if(this.motionMgr.isFinished() && this.motionnm != null){
            // Fade in settings
            this.motions[this.motionnm].setFadeIn(this.fadeines[this.motionnm]);
            // Set fade out
            this.motions[this.motionnm].setFadeOut(this.fadeoutes[this.motionnm]);
            // Priority is low and motion playback
            this.motionMgr.startMotion(this.motions[this.motionnm], 0);
            // Audio files also play
            if(this.sounds[this.motionnm]){
                // Stop if there was previous voice
                if(this.sounds[this.beforesound] != ""){
                    this.sounds[this.beforesound].stop();
                }
                // Play audio
                this.sounds[this.motionnm].play();
                // Store so that it can be stopped halfway
                this.beforesound = this.motionnm;
            }
        }
        // If motion is not specified, nothing is played back
        if(this.motionnm != null){
            // Update motion parameters
            this.motionMgr.updateParam(this.live2DModel);
        }

        // Parameter update (relative change) with expression
        if(this.expressionManager != null &&
           this.expressions != null &&
           !this.expressionManager.isFinished())
        {
            this.expressionManager.updateParam(this.live2DModel);
        }
        // Update pause parameter
        if(this.pose != null)this.pose.updateParam(this.live2DModel);

        // Updating physical operation parameters
        if(this.physics != null)this.physics.updateParam(this.live2DModel);

        // Updating parameters for dragging
        this.dragMgr.update();
        this.dragX = this.dragMgr.getX();
        this.dragY = this.dragMgr.getY();
        this.live2DModel.setParamFloat("PARAM_ANGLE_X", this.dragX * 30);       // Add a value between -30 and 30
        this.live2DModel.setParamFloat("PARAM_ANGLE_Y", this.dragY * 30);
        // Adjustment of body orientation by dragging
        this.live2DModel.setParamFloat("PARAM_BODY_ANGLE_X", this.dragX*10);    // Add value from -10 to 10
        // Adjusting the orientation of eyes by dragging
        this.live2DModel.setParamFloat("PARAM_EYE_BALL_X", this.dragX);         // Add a value from -1 to 1
        this.live2DModel.setParamFloat("PARAM_EYE_BALL_Y", this.dragY);
        // Update character's parameters appropriately
        var t = UtSystem.getTimeMSec() * 0.001 * 2 * Math.PI; // Increase 2π (1 cycle) every second
        var cycle = 3.0; // Time (in seconds) the parameter goes round
        // Breathe
        this.live2DModel.setParamFloat("PARAM_BREATH", 0.5 + 0.5 * Math.sin(t/cycle));

        // Updated Live2D model and rendered
        this.live2DModel.update(); // Calculate vertices etc. according to the current parameters
        this.live2DModel.draw();    // Drawing
    },

    /**
     * Mouse event
     */
    mouseEvent : function(e)
    {
        // Right click control
        e.preventDefault();
        // When mouse is down
       if (e.type == "mousedown") {
           // Leave processing if it is not left click
           if("button" in e && e.button != 0) return;
           this.modelTurnHead(e);

       // When moving the mouse
       } else if (e.type == "mousemove") {
           this.followPointer(e);

       // Mouse up time
       } else if (e.type == "mouseup") {
           // Leave processing if it is not left click
           if("button" in e && e.button != 0) return;
           if (this.drag){
               this.drag = false;
           }
           this.dragMgr.setPoint(0, 0);

       // When a mouse comes outside CANVAS
       } else if (e.type == "mouseout") {
           if (this.drag)
           {
               this.drag = false;
           }
           this.dragMgr.setPoint(0, 0);
       }
    },

    /**
    * Point in the clicked direction
    * Play motion according to the tapped place
    */
    modelTurnHead : function(e)
    {
        this.drag = true;
        var rect = e.target.getBoundingClientRect();

        var sx = this.transformScreenX(e.clientX - rect.left);
        var sy = this.transformScreenY(e.clientY - rect.top);
        var vx = this.transformViewX(e.clientX - rect.left);
        var vy = this.transformViewY(e.clientY - rect.top);

        this.lastMouseX = sx;
        this.lastMouseY = sy;
        this.dragMgr.setPoint(vx, vy); // Facing that direction
    },

    /**
    * Event when moving mouse
    */
    followPointer : function(e)
    {
        var rect = e.target.getBoundingClientRect();
        var sx = this.transformScreenX(e.clientX - rect.left);
        var sy = this.transformScreenY(e.clientY - rect.top);
        var vx = this.transformViewX(e.clientX - rect.left);
        var vy = this.transformViewY(e.clientY - rect.top);

        if (this.drag)
        {
            this.lastMouseX = sx;
            this.lastMouseY = sy;
            this.dragMgr.setPoint(vx, vy); // Facing that direction
        }
    },

    /**
    * The View coordinate X
    */
    transformViewX : function(deviceX)
    {
        var screenX = this.deviceToScreen.transformX(deviceX);  // Obtain coordinates after logical coordinate transformation.
        return this.viewMatrix.invertTransformX(screenX);       // The value after enlargement, reduction, and movement.
    },

    /**
    * The View coordinate Y
    */
    transformViewY : function(deviceY)
    {
        var screenY = this.deviceToScreen.transformY(deviceY);  // Obtain coordinates after logical coordinate transformation.
        return this.viewMatrix.invertTransformY(screenY);       // The value after enlargement, reduction, and movement.
    },

    /**
    * Screen coordinate X after logical coordinate transformation X
    */
    transformScreenX : function(deviceX)
    {
        return this.deviceToScreen.transformX(deviceX);
    },

    /**
    * The Screen coordinate Y
    */
    transformScreenY : function(deviceY)
    {
        return this.deviceToScreen.transformY(deviceY);
    },

    /**
    * Generate texture from Image type object
    */
    createTexture : function(gl/*WebGL context*/, image/*WebGL Image*/)
    {
        var texture = gl.createTexture(); // Create a texture object
        if ( !texture ){
            console.log("Failed to generate gl texture name.");
            return -1;
        }

        if(this.live2DModel.isPremultipliedAlpha() == false) {
            // In cases other than the multiplied alpha texture
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        }
        // Flip image vertically
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        // Specify unit of texture
        gl.activeTexture( gl.TEXTURE0 );
        // Bind a texture
        gl.bindTexture( gl.TEXTURE_2D , texture );
        // Link image data to texture
        gl.texImage2D( gl.TEXTURE_2D , 0 , gl.RGBA , gl.RGBA , gl.UNSIGNED_BYTE , image);
        // Specify the quality of the texture (the value of the point closest to the center of the target pixel)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // Specify the quality of mipmaps
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        // Generation of mipmap
        gl.generateMipmap(gl.TEXTURE_2D);
        // Binding of texture releasing
        gl.bindTexture( gl.TEXTURE_2D , null );

        return texture;
    },

    /**
    * Load file as byte array
    */
    loadBytes : function(path , callback)
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
                console.log( "Failed to load (" + request.status + ") : " + path );
                break;
            }
        }
        request.send(null);
    },

    /**
    * Load Json file
    */
    loadJson : function()
    {
        var thisRef = this;
        var request = new XMLHttpRequest();
        request.open("GET", this.filepath + this.filenm, true);
        request.onreadystatechange = function(){
            if(request.readyState == 4 && request.status == 200){
                // Acquired from model.json
                thisRef.modelDef = JSON.parse(request.responseText);
                // Initialization processing
                thisRef.initLoop();
            }
        }
        request.send(null);
    },

    /**
     * Load facial expressions
     */
    loadExpression : function(name, path){
        var thisRef = this;
        this.loadBytes(path, function(buf) {
            thisRef.expressionsnm[thisRef.expressionsnm.length] = name;
            thisRef.expressions[thisRef.expressions.length] = L2DExpressionMotion.loadJson(buf);
        });
    },

    /**
     * Set facial expression
     */
    setExpression : function(name)
    {
        var cnt = 0;
        for(var i = 0; i < this.expressionsnm.length; i++){
            if(name == this.expressionsnm[i]){
                break;
            }
            cnt++;
        }
        var expression = this.expressions[cnt];
        this.expressionManager.startMotion(expression, false);
    },

    /**
     * Set a random expression
     */
    setRandomExpression : function()
    {
        // Random play
        var random = ~~(Math.random() * this.expressions.length);
        var expression = this.expressions[random];
        this.expressionManager.startMotion(expression, false);
    },

    /**
     * Set motion
     */
    setMotion : function(name)
    {
        if(this.modelDef == null)return;

        var cnt = 0;
        // Retrieve file number from file name
        for(var key in this.modelDef.motions){
            for(var j = 0; j < this.modelDef.motions[key].length; j++){
                // Cut an extra path
                var strfilenm = this.modelDef.motions[key][j].file.split("/");
                if(name == strfilenm[1]){
                    break;
                }
                cnt++;
            }
        }
        this.motionnm = cnt;
        this.motionflg = true;
    },

    /**
     * Random motion playback
     */
    setRandomMotion : function()
    {
        if(this.modelDef == null)return;
        // Random play
        this.motionnm = ~~(Math.random() * this.motions.length);
        this.motionflg = true;
    }
};

/****************************************
* Sound class
****************************************/
var L2DSound = function(path /*Audio File Path*/) {
    this.snd = document.createElement("audio");
    this.snd.src = path;
};

L2DSound.prototype = {
    /**
    * Audio playback
    */
    play : function() {
        this.snd.play();
    },

    /**
    * Audio stop
    */
    stop : function() {
        this.snd.pause();
        this.snd.currentTime = 0;
    }
};
