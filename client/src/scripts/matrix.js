/**
 * Matrix rain effect based on a few sources,
 * - https://dev.to/gnsp/making-the-matrix-effect-in-javascript-din
 * - https://github.com/Rezmason/matrix
 * - https://codepen.io/riazxrazor/pen/Gjomdp
 * 
 */

// Check if we should skip the loading animation.
let url = new URL(window.location.href);
let skipintro = false;

if (url.searchParams.has("skipintro")) {
    skipintro = true;
}

const charArr = ['モ', 'エ', 'ヤ', 'キ', 'オ', 'カ', '7', 'ケ', 'サ', 'ス', 'z', '1', '5', '2', 'ヨ', 'タ', 'ワ', '4', 'ネ', 'ヌ', 'ナ', '9', '8', 'ヒ', '0', 'ホ', 'ア', '3', 'ウ', ' ', 'セ', '¦', ':', '"', '꞊', 'ミ', 'ラ', 'リ', '╌', 'ツ', 'テ', 'ニ', 'ハ', 'ソ', '▪', '—', '<', '>', '0', '|', '+', '*', 'コ', 'シ', 'マ', 'ム', 'メ'];

const backgroundImage = new Image();
backgroundImage.src = document.getElementById('door_image').src;

const webgl = document.getElementById('webgl');
webgl.style.filter = 'saturate(0)';

const canvas = document.getElementById('loader_symbols');
canvas.style.mixBlendMode = "exclusion";
const ctx = canvas.getContext('2d');

const canvas2 = document.getElementById('loader_image');
canvas2.style.display = 'none';
const ctx2 = canvas2.getContext('2d', {
    willReadFrequently: true
});

let w = canvas.width = canvas2.width = window.innerWidth;
let h = canvas.height = canvas2.height = window.innerHeight;

const largeScreen = canvas.width * canvas.height < 2000000;
const portraitMode = canvas.width < canvas.height;
const fontSize = (portraitMode || largeScreen) ? 8 : 15;

let cols = Math.floor(w / fontSize * 1.5) + 1;
let ypos = Array(cols).fill(0);

window.matrix_scene = {
    type: 'fullscreen',
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
    stage: 2,
    /**
     * Timestamp when the current stage began.
     */
    stageStarted: 2,
    /**
     * Stage specific variables.
     */
    // Stage 0
    elapsed: 0,
    // Stage 1
    loaded_done: 0,
    loaded_target: 0,
    // Stage 2
    transition_total: skipintro ? 0 : 1500, // in milliseconds

    // Animates the scene
    animate: function (currentTime) {
        const elapsedSinceLast = currentTime - window.matrix_scene.lastTime;
        window.matrix_scene.currentTime = currentTime;
        window.matrix_scene.elapsed += window.matrix_scene.currentTime - window.matrix_scene.lastTime;
        window.matrix_scene.lastTime = currentTime;
        drawBackground();

        ctx.font = fontSize + 'pt monospace';

        if (window.matrix_scene.stage == 0) {
            ctx.fillStyle = '#0001';
            ctx.fillRect(0, 0, w, h);
            // @todo: implement the intro sequence here - column reduce?

            ypos.forEach((y, ind) => {

                window.matrix_scene.drawSymbol(y, ind);

                if (largeScreen) {
                    window.matrix_scene.elapsed += Math.PI * 10;
                }
                else {
                    window.matrix_scene.elapsed += Math.PI;
                }


                if ((y > 1 + randomInt(1, window.matrix_scene.elapsed))) ypos[ind] = 0;
                else ypos[ind] = y + fontSize;

            });
        }
        if (window.matrix_scene.stage == 1) {
            ctx.fillStyle = "rgba(0,0,0,0.001)";
            ctx.fillRect(0, 0, w, h);
            ypos.forEach((y, ind) => {
                window.matrix_scene.drawSymbol(y, ind);

                if (y > 1 + randomInt(1, 2000 * window.matrix_scene.loaded_done)) ypos[ind] = 0;
                else ypos[ind] = y + fontSize;

            });

        }
        if (window.matrix_scene.stage == 2) {
            ctx.fillStyle = "rgba(0,0,0,0.001)";
            ctx.fillRect(0, 0, w, h);

            ypos.forEach((y, ind) => {
                window.matrix_scene.drawSymbol(y, ind);

                if (canvas.width * canvas.height < 2000000) {
                    window.matrix_scene.elapsed += Math.PI * 10;
                }
                else {
                    window.matrix_scene.elapsed += Math.PI;
                }

                if ((y > 1 + randomInt(1, window.matrix_scene.elapsed))) ypos[ind] = 0;
                else ypos[ind] = y + fontSize;

            });

        }
        if (window.matrix_scene.stage == 3) {
            ypos.forEach((y, ind) => {
                window.matrix_scene.drawSymbol(y, ind);

                if (canvas.width * canvas.height < 2000000) {
                    window.matrix_scene.elapsed += Math.PI * 10;
                }
                else {
                    window.matrix_scene.elapsed += Math.PI;
                }

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
            if (skipintro || (window.l.current_scene && (Date.now() - window.matrix_scene.stageStarted > 100))) {
                window.matrix_scene.stage = 1;
                window.matrix_scene.stageStarted = Date.now();
                for (var measure in window.l.current_scene.loaders.stats) {
                    window.matrix_scene.loaded_target += window.l.current_scene.loaders.stats[measure].target;
                }

                const pageWrapper = document.getElementById('page-wrapper');
                if (pageWrapper) {
                    pageWrapper.style.opacity = 1;
                    pageWrapper.style.transition = 'opacity 1s';
                    pageWrapper.style.opacity = 0;
                }

            }
        }
        if (window.matrix_scene.stage == 1) {
            window.matrix_scene.loaded_done = 0;
            for (var measure in window.l.current_scene.loaders.stats) {
                window.matrix_scene.loaded_done += window.l.current_scene.loaders.stats[measure].loaded;
            }

            if (
                skipintro || 
                window.matrix_scene.loaded_done == window.matrix_scene.loaded_target && (Date.now() - window.matrix_scene.stageStarted > 100)
            ) {
                window.matrix_scene.stage = 2;
                window.matrix_scene.stageStarted = Date.now();
            }
        }
        if (window.matrix_scene.stage == 2) {
            if (
                (skipintro && window.l.current_scene.ready == true) || 
                (
                    window.l.current_scene.ready == true &&
                    (Date.now() - window.matrix_scene.stageStarted > 100)
                )
            ) {
                window.matrix_scene.stage = 3;
                window.matrix_scene.stageStarted = Date.now();
                canvas.style.transition = 'filter 5s, transform 5s';
                webgl.style.transition = 'filter 3s 2s, opacity 1s';

                canvas.style.transform = "scale(5)";
                canvas.style.filter = "blur(5px)";

                webgl.style.filter = "saturate(1)";
                webgl.style.opacity = 1;
            }
        }
        if (window.matrix_scene.stage == 3) {
            if (
                skipintro || 
                (Date.now() - window.matrix_scene.stageStarted) > window.matrix_scene.transition_total
            ) {
                clearInterval(window.matrix_scene.interval);
                window.matrix_scene.complete = true;
            }
        }
    },
    // Start
    start: function () {
        ctx.fillStyle = '#0001';
        ctx.fillRect(0, 0, w, h);

        window.addEventListener('orientationchange', handleViewportChange);
        window.addEventListener('resize', handleViewportChange);

        // Hide body element scrollbars as the 3D viewport takes over.
        document.querySelector("body").style.overflow = 'hidden';
        window.matrix_scene.stageStarted = Date.now();
        window.matrix_scene.interval = setInterval(window.matrix_scene.updateStage, 100);
        requestAnimationFrame(window.matrix_scene.animate);
    }
};

// Function to draw the background image
function drawBackground() {
    var imageAspectRatio = backgroundImage.width / backgroundImage.height;
    var canvasAspectRatio = w / h;
    var scale = 1;

    if (imageAspectRatio > canvasAspectRatio) {
        // Image is wider than the canvas, scale based on width
        scale = w / (backgroundImage.width * 0.125);
    } else {
        // Image is taller than the canvas, scale based on height
        scale = h / (backgroundImage.height * 0.125);
    }

    var scaledWidth = backgroundImage.width * scale;
    var scaledHeight = backgroundImage.height * scale;

    // Calculate the top-left coordinates of the image to center it
    var imageX = (w - scaledWidth) / 2;
    var imageY = (-scaledHeight / 55) + (h - scaledHeight) / 2;

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
    return `rgb(${Math.floor(r / count)}, ${Math.floor(g / count)}, ${Math.floor(b / count)})`;
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function handleViewportChange() {
    w = canvas.width = canvas2.width = window.innerWidth;
    h = canvas.height = canvas2.height = window.innerHeight;
    cols = Math.floor(w / fontSize * 1.5) + 1;
    ypos = Array(cols).fill(0);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
}
