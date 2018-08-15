// container for video element + text
// is overlayed onto webpage with screen to obscure text 
let divContainer = document.createElement("div");

//Boolean for blur
let isBlurred = false;

// canvas elements
// canvas holds video screenshots 
let canvas = document.createElement("canvas"); //Pre-load the Canvas for capturing
canvas.style.display = "none";

// preload the video
let video = document.createElement("video");

// creates checkmark element container (div)
let checkElement = document.createElement("div");

// creates checkmark element
var img = document.createElement("img");
let m_Stream = null;

//Interval that is created to deal with CSS stylesheet changes
let intervalCSSId;

// timer for fading in and out (works with both)
// changing it changes the amount of time it takes to fade out (in ms)
const FADE_TIMER_LOOP = 50;

// changes the "smoothness" of the fade 
// smaller means fades in smaller intervals
const FADE_INTERVAL = 0.1;

/**
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 *
 * @returns {Uint8Array}
 */
function captureFrame(video, canvas) {
    console.log(`Video size: ${video.width}x${video.height}`);
    canvas.width = video.width;
    canvas.height = video.height;

    document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(video, 0, 0);

    // convert the canvas to a base64-encoded png file
    let data = canvas.toDataURL('image/png').split(',')[1];
    document.body.removeChild(canvas);

    return data;
}

//Listener that appends a video element with webcam stream as src
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request.type);

    switch (request.type) {
        case 'StartCapture':
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

            setupVid();
            break;
        case "EndCapture": //Does it by itself
            video.remove();
            break;
        case 'GetFrame':
            if (video.srcObject !== null) {
                sendResponse(captureFrame(video, canvas));
            } else {
                console.log("No webcam stream available");
            }
            break;
        case "Unblur":
            stopCSSInterval();
            isBlurred = false;
            removeBlur().then(() => {
                browser.runtime.sendMessage({
                    type: 'IsLockEnabled'
                }, enabled => {
                    if (enabled) {
                        setupVid();
                    }
                });
            });
            break;
        case "Blur":
            addBlur("Locked");
            setCSSInterval();
            navigator.mediaDevices.getUserMedia({ //Get webcam stream
                video: true
            }).then(function (stream) { //set video element's src to the webcam stream
                m_Stream = stream;
                video.srcObject = stream;
                let vidTrack = stream.getVideoTracks()[0];
                video.width = vidTrack.getSettings().width;
                video.height = vidTrack.getSettings().height;
            }).catch(function (e) {
                console.log(e);
            }); //error catch
            isBlurred = true;
            break;
        case "ShowCalibrateScreen":
            document.body.removeChild(video);
            addBlur("Calibrating...");
            isBlurred = true;
            break;
        case "HideCalibrateScreen":
            isBlurred = false;
            addCheckmark();

            // timeout allows checkmark to load
            setTimeout(() => {
                removeBlur().then(() => {
                    browser.runtime.sendMessage({
                        type: 'IsLockEnabled'
                    }, enabled => {
                        if (enabled) {
                            setupVid();
                        }
                    });
                });
            }, 1500);
            // create variables for timers, or arbitrary numbers 
            // hideCalibrateScreenTimer 
            break;
        case "AlertSlouch":
            alert("You are slouching");
            break;
        default:
            console.log("Invalid Request Type");
    }
});

function setupVid() {
    // sets up video element
    video.autoplay = true;
    video.style.display = "none";
    video.style.width = "450px";
    video.style.height = "450px";
    video.style.borderRadius = "350px";

    //Getting the video element, first checking if the user has an accessible webcam
    navigator.mediaDevices.getUserMedia({ //Get webcam stream
        video: true
    }).then(function (stream) { //set video elemnt's src to the webcam stream
        m_Stream = stream;
        video.srcObject = stream;
        let vidTrack = stream.getVideoTracks()[0];
        video.width = vidTrack.getSettings().width;
        video.height = vidTrack.getSettings().height;
    }).catch(function (e) {
        console.log(e);
    }); //error catch

    document.body.appendChild(video);
}

/**
 * Creates a new div to move current webpage html into
 * Creates a new div to append video and text
 * Blurs the current webpage
 */
function addBlur(onScreenText) {
    video.remove();

    divContainer = document.createElement('div');
    // div container ID
    divContainer.id = "divContainer";

    // clears preset div settings
    divContainer.style.clear = "both";

    // sets divContainer to be a flexbox
    divContainer.style.display = "flex";

    // formatting elements within the divContainer
    divContainer.style.alignItems = "center";
    divContainer.style.justifyContent = "center";
    divContainer.style.flexDirection = "column";

    divContainer.style.position = "fixed";
    divContainer.style.zIndex = "100000000";
    divContainer.style.width = "100%";
    divContainer.style.height = "100%";
    divContainer.style.backgroundColor = 'white';

    divContainer.style.top = "50%";
    divContainer.style.left = "50%";
    divContainer.style.right = "50%";
    divContainer.style.bottom = "50%";
    divContainer.style.transform = "translate(-50%, -50%)";
    divContainer.style.lineHeight = "200%";

    // adds video to divContainer
    video.style.display = "inherit";
    divContainer.appendChild(video);

    // formats text to put on screen with video element
    let para = document.createElement('h1');
    para.style.all = "initial";
    para.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    para.style.color = "black";
    para.style.backgroundColor = "white"; 
    para.style.fontWeight = "normal"; 
    para.style.textShadow = "none"; 
    para.style.fontSize = "40px";
    para.style.textAlign = "center";
    para.innerText = onScreenText;

    divContainer.appendChild(para);

    // video attached to divContainer, attached to webpage
    document.body.appendChild(divContainer);
    fadeIn(divContainer);
}

/**
 * Adds check to the top of the video stream when necessary
 */
function addCheckmark() {
    let img = document.createElement('img');
    //gets image from an online source
    img.src = "https://cdn3.iconfinder.com/data/icons/sympletts-free-sampler/128/circle-check-512.png";

    //sets image dimensions to smaller than the video
    img.style.width = "350px";
    img.style.height = "350px";

    img.style.position = "fixed";

    img.style.top = "50%";
    img.style.left = "50%";
    img.style.right = "50%";
    img.style.bottom = "50%";
    img.style.transform = "translate(-50%, -50%)";

    if (divContainer) {
        divContainer.appendChild(img);
        fadeIn(img);
    }
}

/**
 * Function removing both the check and the blur
 */
function removeBlur() {
    return fadeOut(divContainer).then(() => {
        divContainer.remove();
        divContainer = null;
    });
}

/**
 *
 * @param {*} element Element to be faded in and out 
 * Credit: https://leewc.com/articles/javascript-fade-in-out-callback/ 
 */
function fadeIn(element) {
    var op = 0; // initial opacity

    return new Promise((resolve, reject) => {
        var timer = setInterval(function () {
            if (op >= 1) {
                clearInterval(timer);
                resolve();
            }
            element.style.opacity = op;
            // multiplied by 100 (percentage)
            element.style.filter = "alpha(opacity=" + op * 100 + ")";
            // slowly increases opacity (linear)
            op += FADE_INTERVAL;
        }, FADE_TIMER_LOOP);
    });
}

function fadeOut(element) {
    var op = 1; // initial opacity

    return new Promise((resolve, reject) => {
        var timer = setInterval(function () {
            if (op <= 0.0) {
                clearInterval(timer);
                resolve();
            }
            element.style.opacity = op;
            // multiplied by 100 (percentage)
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            // slowly reduces opacity (linear)
            op -= FADE_INTERVAL;
        }, FADE_TIMER_LOOP);
    });
}

function setCSSInterval() {
    intervalCSSId = setInterval(function () {
        divContainer.style.backgroundColor = "white";
    }, 100);
}

function stopCSSInterval() {
    clearInterval(intervalCSSId);
}

function calibrationAnimation()
{
    // creates spinner element
    let spinner = document.createElement("div"); 
    spinner.id = "spinner"; 

    // format for spinner + animations with css 
    spinner.style.width = "75px"; 
    spinner.style.height = "75px"; 
    spinner.style.margin = "0"; 
    spinner.style.background = "transparent"; 
    spinner.style.borderTop = "4px solid #03A9F4"; 
    spinner.style.borderRight = "4px solid transparent"; 
    spinner.style.borderRadius = "50%"; 
    spinner.style.webkitAnimation = "1s spin linear infinite"; 
    spinner.style.animation = "1s spin linear infinite"; 

    var sheet = (function() {
        var style = document.createElement("style"); 
        style.appendChild(document.createTextNode(""))
        document.head.appendChild(style); 
    })

    
}

//Create mutation observer
var observer = new MutationObserver(function (mutations, observer) {
    // executes when a mutation occurs
    mutations.forEach(function (mutationRecord) { //For each mutationRecord, check if style was changed or a DOM element was removed
        if (isBlurred && mutationRecord.type === "attributes") { //style
            divContainer.style.backgroundColor = "white";
        }

        if (isBlurred && mutationRecord.type === "childList") { //DOM element removed
            mutationRecord.removedNodes.forEach(function (node) {
                if (node.nodeName !== "CANVAS") {
                    if (node.nodeName === "DIV") { //Only put back element with video in it
                        if (Array.from(node.childNodes).includes(video)) {
                            document.body.appendChild(node);
                            for (let i = node.childNodes; i > 0; i--) {
                                node.appendChild(node.childNodes.item(i));
                            }
                            navigator.mediaDevices.getUserMedia({ //Get webcam stream
                                video: true
                            }).then(function (stream) { //set video element's src to the webcam stream
                                m_Stream = stream;
                                video.srcObject = stream;
                                let vidTrack = stream.getVideoTracks()[0];
                                video.width = vidTrack.getSettings().width;
                                video.height = vidTrack.getSettings().height;
                            }).catch(function (e) {
                                console.log(e);
                            });
                        } //error catch
                    }
                }
            });
        }
    });
});

//tell oberver what to observe
observer.observe(
    document, {
        attributes: true,
        attributeOldValue: true,
        childList: true,
        subtree: true
    }
);
