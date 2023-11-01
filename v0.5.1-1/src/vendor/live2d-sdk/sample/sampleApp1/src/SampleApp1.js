var thisRef = this;

function sampleApp1()
{
    this.live2DMgr = new LAppLive2DManager();

    this.isDrawStart = false;
    
    this.gl = null;
    this.canvas = null;
    
    this.dragMgr = null; /*new L2DTargetPoint();*/ 
    this.viewMatrix = null; /*new L2DViewMatrix();*/
    this.projMatrix = null; /*new L2DMatrix44()*/
    this.deviceToScreen = null; /*new L2DMatrix44();*/
    
    this.drag = false; 
    
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    
    initL2dCanvas("glcanvas");
    
    
    init();
}


function initL2dCanvas(canvasId)
{
    l2dLog("--> onCreateContext()");

    
	this.canvas = document.getElementById(canvasId);
    
    
    if(this.canvas.addEventListener) {
        this.canvas.addEventListener("mousewheel", onWheel, false);
        this.canvas.addEventListener("click", onClick, true);
        this.canvas.addEventListener("mousedown", onMouseDown, false);
        this.canvas.addEventListener("mousemove", onMouseMove, false);
        this.canvas.addEventListener("mouseup", onMouseUp, false);
        this.canvas.addEventListener("mouseout", onMouseOut, false);
        this.canvas.addEventListener("contextmenu", onMouseRightClick, false);
    }
}


function init()
{
    l2dLog("--> init()");
    
    
    var width = this.canvas.width;
    var height = this.canvas.height;
    
    this.dragMgr = new L2DTargetPoint();

    
    var ratio = height / width;
    var left = LAppDefine.VIEW_LOGICAL_LEFT;
    var right = LAppDefine.VIEW_LOGICAL_RIGHT;
    var bottom = -ratio;
    var top = ratio;

    this.viewMatrix = new L2DViewMatrix();

    
    this.viewMatrix.setScreenRect(left, right, bottom, top);
    
    
    this.viewMatrix.setMaxScreenRect(LAppDefine.VIEW_LOGICAL_MAX_LEFT,
                                     LAppDefine.VIEW_LOGICAL_MAX_RIGHT,
                                     LAppDefine.VIEW_LOGICAL_MAX_BOTTOM,
                                     LAppDefine.VIEW_LOGICAL_MAX_TOP); 

    this.viewMatrix.setMaxScale(LAppDefine.VIEW_MAX_SCALE);
    this.viewMatrix.setMinScale(LAppDefine.VIEW_MIN_SCALE);

    this.projMatrix = new L2DMatrix44();
    this.projMatrix.multScale(1, (width / height));

    
    this.deviceToScreen = new L2DMatrix44();
    this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
    this.deviceToScreen.multScale(2 / width, -2 / width);
    
    
    
	this.gl = getWebGLContext();
	if (!this.gl) {
        l2dError("Failed to create WebGL context.");
        return;
    }

	
	this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

    changeModel();
    
    startDraw();
}


function startDraw() {
    if(!this.isDrawStart) {
        this.isDrawStart = true;
        (function tick() {
                draw(); 

                var requestAnimationFrame = 
                    window.requestAnimationFrame || 
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame || 
                    window.msRequestAnimationFrame;

                
                requestAnimationFrame(tick ,this.canvas);   
        })();
    }
}


function draw()
{
    // l2dLog("--> draw()");

    MatrixStack.reset();
    MatrixStack.loadIdentity();
    
    this.dragMgr.update(); 
    this.live2DMgr.setDrag(this.dragMgr.getX(), this.dragMgr.getY());
    
    
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    MatrixStack.multMatrix(projMatrix.getArray());
    MatrixStack.multMatrix(viewMatrix.getArray());
    MatrixStack.push();
    
    for (var i = 0; i < this.live2DMgr.numModels(); i++)
    {
        var model = this.live2DMgr.getModel(i);

        if(model == null) return;
        
        if (model.initialized && !model.updating)
        {   
            model.update();
            model.draw(this.gl);
        }
    }
    
    MatrixStack.pop();
}


function changeModel()
{
    this.live2DMgr.reloadFlg = true;
    this.live2DMgr.count++;

    this.live2DMgr.changeModel(this.gl);
}




function onWheel(e)
{
    e.preventDefault();
    
    if (e.clientX < 0 || thisRef.canvas.clientWidth < e.clientX || 
        e.clientY < 0 || thisRef.canvas.clientHeight < e.clientY)
    {
        return;
    }
    
    
    var sx = transformScreenX(e.clientX);
    var sy = transformScreenY(e.clientY);
    var vx = transformViewX(e.clientX);
    var vy = transformViewY(e.clientY);

    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog("onWheel device( x:" + e.clientX + " y:" + e.clientY + " ) screen( x:" + sx + " y:" + sy + ")" + " ) view( x:" + vx + " y:" + vy + ")");

    var isMaxScale = thisRef.viewMatrix.isMaxScale();
    var isMinScale = thisRef.viewMatrix.isMinScale();

    if (e.wheelDelta > 0)
    {
        
        thisRef.viewMatrix.adjustScale(sx, sy, 1.1);
    }
    else
    {
        
        thisRef.viewMatrix.adjustScale(sx, sy, 0.9);
    }

    
    if (!isMaxScale)
    {
        if (thisRef.viewMatrix.isMaxScale())
        {
            thisRef.live2DMgr.maxScaleEvent();
        }
    }
    
    if (!isMinScale)
    {
        if (thisRef.viewMatrix.isMinScale())
        {
            thisRef.live2DMgr.minScaleEvent();
        }
    }
    
    
}



function onClick(e)
{    
    
    if(e.button != 0) return;
    
    var sx = transformScreenX(e.clientX);
    var sy = transformScreenY(e.clientY);
    var vx = transformViewX(e.clientX);
    var vy = transformViewY(e.clientY);
    
    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog("onClick device( x:" + e.clientX + " y:" + e.clientY + " ) screen( x:" + sx + " y:" + sy + ")" + " ) view( x:" + vx + " y:" + vy + ")");

    thisRef.live2DMgr.tapEvent(vx, vy);
}



function onMouseDown(e)
{
    
    if(e.button != 0) return;
    
    thisRef.drag = true;
    var sx = transformScreenX(e.clientX);
    var sy = transformScreenY(e.clientY);
    var vx = transformViewX(e.clientX);
    var vy = transformViewY(e.clientY);
    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog("onMouseDown device( x:" + e.clientX + " y:" + e.clientY + " ) view( x:" + vx + " y:" + vy + ")");

    thisRef.lastMouseX = sx;
    thisRef.lastMouseY = sy;

    thisRef.dragMgr.setPoint(vx, vy); 
}



function onMouseMove(e)
{
    var sx = transformScreenX(e.clientX);
    var sy = transformScreenY(e.clientY);
    var vx = transformViewX(e.clientX);
    var vy = transformViewY(e.clientY);
    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog("onMouseMove device( x:" + e.clientX + " y:" + e.clientY + " ) view( x:" + vx + " y:" + vy + ")");

    if (thisRef.drag)
    {
        thisRef.lastMouseX = sx;
        thisRef.lastMouseY = sy;

        thisRef.dragMgr.setPoint(vx, vy); 
    }
}
		
		

function onMouseUp(e)
{
    if (thisRef.drag)
    {
        thisRef.drag = false;
    }
    var x = transformViewX(e.clientX);
    var y = transformViewY(e.clientY);
    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog("onMouseUp device( x:" + e.clientX + " y:" + e.clientY + " ) view( x:" + x + " y:" + y + ")");
    
    thisRef.dragMgr.setPoint(0, 0);
}



function onMouseOut(e)
{
    if (thisRef.drag)
    {
        thisRef.drag = false;
    }
    
    thisRef.dragMgr.setPoint(0, 0);
}



function onMouseRightClick(e)
{
    e.preventDefault();
    
    changeModel();
    
    // init(this);
}




function transformViewX(deviceX)
{
    var screenX = this.deviceToScreen.transformX(deviceX); 
    return viewMatrix.invertTransformX(screenX); 
}


function transformViewY(deviceY)
{
    var screenY = this.deviceToScreen.transformY(deviceY); 
    return viewMatrix.invertTransformY(screenY); 
}


function transformScreenX(deviceX)
{
    return this.deviceToScreen.transformX(deviceX);
}


function transformScreenY(deviceY)
{
    return this.deviceToScreen.transformY(deviceY);
}



function getWebGLContext()
{
	var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];
	
	for( var i = 0; i < NAMES.length; i++ ){
		try{
			var ctx = this.canvas.getContext(NAMES[i]);
			if(ctx) return ctx;
		} 
		catch(e){}
	}
	return null;
};



function l2dLog(msg) {
    if(!LAppDefine.DEBUG_LOG) return;
    
    console.log(msg);
}



function l2dError(msg)
{
    if(!LAppDefine.DEBUG_LOG) return;
    
	console.error(msg);
};