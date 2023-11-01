/**
 * Poke Matrix
 * 
 * Pocket sized loading effect.
 * 
 */

const charArr = ['モ', 'エ', 'ヤ', 'キ', 'オ', 'カ', '7', 'ケ', 'サ', 'ス', 'z', '1', '5', '2', 'ヨ', 'タ', 'ワ', '4', 'ネ', 'ヌ', 'ナ', '9', '8', 'ヒ', '0', 'ホ', 'ア', '3', 'ウ', ' ', 'セ', '¦', ':', '"', '꞊', 'ミ', 'ラ', 'リ', '╌', 'ツ', 'テ', 'ニ', 'ハ', 'ソ', '▪', '—', '<', '>', '0', '|', '+', '*', 'コ', 'シ', 'マ', 'ム', 'メ'];

const backgroundImage = new Image();
let isDesktop = window.innerWidth > 640;
backgroundImage.src = isDesktop ? document.getElementById('exit_image').src : document.getElementById('exit_image_mobile').src  ;

const webgl = document.getElementById('webgl');
webgl.style.filter = 'saturate(0)';

const canvas = document.getElementById('pokematrixCanvas');
const ctx = canvas.getContext('2d');
const canvas2 = document.getElementById('pokematrixImage');
canvas2.style.display = 'none';
const ctx2 = canvas2.getContext('2d', {
    willReadFrequently: true
});

let exitButton = document.getElementById('pokematrixSign');

let w = canvas.width = canvas2.width = exitButton.offsetWidth + 10;
let h = canvas.height = canvas2.height = exitButton.offsetHeight + 10;

const largeScreen = canvas.width * canvas.height < 2000000;
const portraitMode = canvas.width < canvas.height;
const fontSize = (portraitMode || largeScreen) ? 2 : 2;

let cols = Math.floor(w / fontSize ) + 1;
let ypos = Array(cols).fill(0);

window.matrix_scene = {
    type: 'button',
    interval: false,
    complete: false,
    currentTime: 0,
    lastTime: 0,
    /**
     * Stages:
     *  - 0 Intro - load virtual office
     *  - 1 Fill viewport with numbers - load virtual office assets
     *  - 2 Buy time to fill the matrix (if it loaded from cache / too fast)
     *  - 3 Enter the matrix - start
     */
    stage: 0,
    /**
     * Timestamp when the current stage began.
     */
    stageStarted: 0,
    /**
     * Stage specific variables.
     */
    // Stage 0
    elapsed: 0,
    // Stage 1
    loaded_done: 0,
    loaded_target: 0,
    // Stage 2
    transition_total: 1250, // in milliseconds

    // Animates the scene
    animate: function (currentTime) {
        const elapsedSinceLast = currentTime - window.matrix_scene.lastTime;
        window.matrix_scene.currentTime = currentTime;
        window.matrix_scene.elapsed += window.matrix_scene.currentTime - window.matrix_scene.lastTime;
        window.matrix_scene.lastTime = currentTime;
        drawBackground();

        ctx.font = fontSize + 'pt monospace';

        if (window.matrix_scene.stage == 0) {
            ctx.fillStyle = "rgba(0,0,0,0.00125)";
            ctx.fillRect(0, 0, w, h);
            // @todo: implement the intro sequence here - column reduce?

            ypos.forEach((y, ind) => {

                window.matrix_scene.drawSymbol(y, ind);



                if ((y > 1 + randomInt(1, window.matrix_scene.elapsed))) ypos[ind] = 0;
                else ypos[ind] = y + fontSize;

            });
        }
        if (window.matrix_scene.stage == 1) {
            ctx.fillStyle = "rgba(0,0,0,0.0025)";
            ctx.fillRect(0, 0, w, h);
            ypos.forEach((y, ind) => {
                window.matrix_scene.drawSymbol(y, ind);

                if (y > 1 + randomInt(1, 2000 * window.matrix_scene.loaded_done)) ypos[ind] = 0;
                else ypos[ind] = y + fontSize;

            });

        }
        if (window.matrix_scene.stage == 2) {
            ctx.fillStyle = "rgba(0,0,0,0.005)";
            ctx.fillRect(0, 0, w, h);

            ypos.forEach((y, ind) => {
                window.matrix_scene.drawSymbol(y, ind);

                if ((y > 1 + randomInt(1, window.matrix_scene.elapsed))) ypos[ind] = 0;
                else ypos[ind] = y + fontSize;

            });

        }
        if (window.matrix_scene.stage == 3) {

            ctx.fillStyle = "rgba(0,0,0,0.005)";
            ctx.fillRect(0, 0, w, h);
            ypos.forEach((y, ind) => {
                window.matrix_scene.drawSymbol(y, ind);

                if ((y > 1 + randomInt(1, window.matrix_scene.elapsed))) ypos[ind] = 0;
                else ypos[ind] = y + fontSize;

            });
        }

        if (!window.matrix_scene.complete) {
            requestAnimationFrame(window.matrix_scene.animate);
        }
    },
    drawSymbol: function (y, ind) {
        const text = charArr[randomInt(0, charArr.length - 1)].toUpperCase();
        const x = ind * fontSize * 1.5;

        ctx.fillStyle = getAverageColor(ctx2, x, y);
        ctx.fillText(text, x, y);
    },
    // Updates the scene
    updateStage: function () {
        if (window.matrix_scene.stage == 0) {
            if (window.virtual_office && (Date.now() - window.matrix_scene.stageStarted > 500)) {
                window.matrix_scene.stage = 1;
                window.matrix_scene.stageStarted = Date.now();
                for (var measure in window.virtual_office.loaders.stats) {
                    window.matrix_scene.loaded_target += window.virtual_office.loaders.stats[measure].target;
                }

            }
        }
        if (window.matrix_scene.stage == 1) {
            window.matrix_scene.loaded_done = 0;
            for (var measure in window.virtual_office.loaders.stats) {
                window.matrix_scene.loaded_done += window.virtual_office.loaders.stats[measure].loaded;
            }

            if (
                window.matrix_scene.loaded_done == window.matrix_scene.loaded_target && (Date.now() - window.matrix_scene.stageStarted > 500)
            ) {
                window.matrix_scene.stage = 2;
                window.matrix_scene.stageStarted = Date.now();
            }
        }
        if (window.matrix_scene.stage == 2) {
            if (
                window.virtual_office.ready == true &&
                (Date.now() - window.matrix_scene.stageStarted > 500)
            ) {
                window.matrix_scene.stage = 3;
                window.matrix_scene.stageStarted = Date.now();
                canvas.style.transition = 'filter 2.5s, transform 2.5s, opacity 2.5s';
                canvas.style.transform = "scale(5)";
                canvas.style.filter = "blur(5px)";
                canvas.style.opacity = 0;

                exitButton.style.transition = 'opacity 2s';
                exitButton.style.opacity = 1;
            }
        }
        if (window.matrix_scene.stage == 3) {
            if (
                (Date.now() - window.matrix_scene.stageStarted) > window.matrix_scene.transition_total
            ) {
                clearInterval(window.matrix_scene.interval);
                canvas.style.display = 'none';
                exitButton.addEventListener( 'click', downTheRabbitHole);
            }
        }
    },
    // Start
    start: function () {
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, w, h);

        window.addEventListener('orientationchange', handleViewportChange);
        window.addEventListener('resize', handleViewportChange);

        window.matrix_scene.stageStarted = Date.now();
        window.matrix_scene.interval = setInterval(window.matrix_scene.updateStage, 100);
        requestAnimationFrame(window.matrix_scene.animate);
    }
};

function downTheRabbitHole() {
    document.title = 'Open Studios | Perth, Western Australia';
    const pageWrapper = document.getElementById('page-wrapper');
    
    pageWrapper.style.opacity = 1;
    pageWrapper.style.transition = 'opacity 1s';
    pageWrapper.style.opacity = 0;

    // Hide the pageWrapper on completion so the iframed pages don't clash.
    setTimeout( () => {
        window.matrix_scene.complete = true;
        pageWrapper.remove();

        // Animate the camera resetting from any other position.
        window.virtual_office.tweens.resetCameraRotation.start();
        window.virtual_office.tweens.resetCameraPosition.start();
    }, 1000);

    webgl.style.transition = 'filter 3s 2s, opacity 4s';
    webgl.style.filter = "saturate(1)";
    webgl.style.opacity = 1;

    // Hide body element scrollbars as the 3D viewport takes over.
    document.querySelector("body").style.overflow = 'hidden';

}

// Function to draw the background image
function drawBackground() {
    var scale = isDesktop ? 1 : 0.8;

    var scaledWidth =  canvas.width * scale;
    var scaledHeight =  canvas.height * scale;

    // Calculate the top-left coordinates of the image to center it
    var imageX =  (w - scaledWidth) / 2;
    var imageY = 2.5 + (h - scaledHeight) / 2;

    if (!isDesktop) {
        imageX += ( 0.1 ) * canvas.width;
        imageY -= ( 0.1 ) * canvas.height;
    }

    // Draw the image on the canvas at the calculated position
    ctx2.drawImage(backgroundImage, imageX, imageY, scaledWidth, scaledHeight);
}

function getAverageColor(context, x, y) {
    const imageData = context.getImageData(x, y, 5, 5).data;
    let r = 0,
        g = 0,
        b = 0;
    let randomDelta = Math.tan(randomInt(1, 50)) * 2;
    for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i] + randomDelta;
        g += imageData[i + 1] + randomDelta;
        b += imageData[i + 2] + randomDelta;
    }
    const count = imageData.length / 4;
    if (Math.floor(g / count) <=0 ) {
        return `rgba(0,0,0,0.0001)`;
        
    }
    else {
        return `rgb(${Math.floor(r / count)}, ${Math.floor(g / count)}, ${Math.floor(b / count)})`;
    }
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function handleViewportChange() {

    w = canvas.width = canvas2.width = exitButton.offsetWidth;
    h = canvas.height = canvas2.height = exitButton.offsetHeight;
    cols = Math.floor(w / fontSize) + 1;
    ypos = Array(cols).fill(0);

    ctx.fillStyle = '#0000';
    ctx.fillRect(0, 0, w, h);

    isDesktop = window.innerWidth > 640;
    backgroundImage.src = isDesktop ? document.getElementById('exit_image').src : document.getElementById('exit_image_mobile').src  ;
}