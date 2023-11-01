function LAppLive2DManager()
{
    // console.log("--> LAppLive2DManager()");
    
    
    this.models = [];  

    
    this.count = -1;
    this.reloadFlg = false; 
    
    Live2D.init();
    Live2DFramework.setPlatformManager(new PlatformManager);
    
}

LAppLive2DManager.prototype.createModel = function()
{
    
    
    var model = new LAppModel();
    this.models.push(model);
    
    return model;
}


LAppLive2DManager.prototype.changeModel = function(gl)
{
    // console.log("--> LAppLive2DManager.update(gl)");
    
    if (this.reloadFlg)
    {
        
        this.reloadFlg = false;
        var no = parseInt(this.count % 3);

        var thisRef = this;
        switch (no)
        {
            case 0: 
                this.releaseModel(1, gl);
                this.releaseModel(0, gl);
                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_HARU, function() {
                    // thisRef.models[0].feedIn();
                    
                    
                    thisRef.resetExpression(thisRef.models[0]);
                });
                break;
            case 1: 
                this.releaseModel(0, gl);
                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_SHIZUKU, function() {
                    // thisRef.models[0].feedIn();

                    
                    thisRef.resetExpression(thisRef.models[0]);
                });
                break;
            case 2: 
                this.releaseModel(0, gl);
                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_WANKO, function() {
                    // thisRef.models[0].feedIn();
                });
                break;
            case 3: 
                this.releaseModel(0, gl);
                
                this.models = [];

                this.createModel();
                this.models[0].load(gl, LAppDefine.MODEL_HARU_A, function() {
                    
                    thisRef.resetExpression(thisRef.models[0]);
                    
                    thisRef.createModel();
                    thisRef.models[1].load(gl, LAppDefine.MODEL_HARU_B, function() {
                        // thisRef.models[0].feedIn();
                        // thisRef.models[1].feedIn();
                        
                        
                        thisRef.resetExpression(thisRef.models[1]);
                    });
                });
                
                break;
            default:
                break;
        }
    }
};


LAppLive2DManager.prototype.getModel = function(no)
{
    // console.log("--> LAppLive2DManager.getModel(" + no + ")");
    
    if (no >= this.models.length) return null;
    
    return this.models[no];
};



LAppLive2DManager.prototype.releaseModel = function(no, gl)
{
    // console.log("--> LAppLive2DManager.releaseModel(" + no + ")");
    
    if (this.models.length <= no) return;

    this.models[no].release(gl);
    
    delete this.models[no];
    this.models.splice(no, 1);
};



LAppLive2DManager.prototype.numModels = function()
{
    return this.models.length;
};



LAppLive2DManager.prototype.setDrag = function(x, y)
{
    for (var i = 0; i < this.models.length; i++)
    {
        this.models[i].setDrag(x, y);
    }
}



LAppLive2DManager.prototype.maxScaleEvent = function()
{
    if (LAppDefine.DEBUG_LOG)
        console.log("Max scale event.");
    for (var i = 0; i < this.models.length; i++)
    {
        this.models[i].startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_IN,
                                         LAppDefine.PRIORITY_NORMAL);
    }
}
		


LAppLive2DManager.prototype.minScaleEvent = function()
{
    if (LAppDefine.DEBUG_LOG)
        console.log("Min scale event.");
    for (var i = 0; i < this.models.length; i++)
    {
        this.models[i].startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_OUT,
                                         LAppDefine.PRIORITY_NORMAL);
    }
}



LAppLive2DManager.prototype.tapEvent = function(x, y)
{    
    if (LAppDefine.DEBUG_LOG)
        console.log("tapEvent view x:" + x + " y:" + y);
    
    for (var i = 0; i < this.models.length; i++)
    {
        
        if (this.models[i].hitTest(LAppDefine.HIT_AREA_HEAD, x, y))
        {
            
            if (LAppDefine.DEBUG_LOG)
                console.log("Tap face.");

            this.models[i].setRandomExpression();
        }
        else if (this.models[i].hitTest(LAppDefine.HIT_AREA_BODY, x, y))
        {
            
            if (LAppDefine.DEBUG_LOG)
                console.log("Tap body." + " models[" + i + "]");

            this.models[i].startRandomMotion(LAppDefine.MOTION_GROUP_TAP_BODY,
                                             LAppDefine.PRIORITY_NORMAL);
        }
    }
    
    return true;
};


LAppLive2DManager.prototype.resetExpression = function(model) {
    if(model == null) return;
    if(model.expressions == null) return;
    
    var motion = model.expressions[0];
    // model.expressionManager.startMotion(motion, false);
    model.setExpression(motion);
};
