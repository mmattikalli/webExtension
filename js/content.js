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

//Stores the ratio of the previous frame's face and the video.width
//Gets replaced when the ratio is increased, indicating user might need a more zoomed in screen
let pastNum = null;
//On page refresh, reset pastNum

//If the page zoom function is enabled
let isZoomEnabled = false;

//set to create a max interval between notification alerts
let lastNotificationTime = Date.now();

const TIME_BETWEEN_NOTIFICATIONS = 10000;

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
    let width = canvas.width;
    let height = canvas.height;

    document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(video, 0, 0);

    // convert the canvas to a base64-encoded png file
    let data = canvas.toDataURL('image/png').split(',')[1];
    document.body.removeChild(canvas);

    return {
        "data": data,
        "width": width,
        "height": height
    }
}

//Listener that appends a video element with webcam stream as src
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request.type);

    switch (request.type) {
        case 'StartCapture':
            setupVid();
            break;
        case "EndCapture":
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
            removeBlur(request.shouldFade);
            break;
        case "Blur":
            addBlur("Locked", request.shouldFade);
            setCSSInterval();
            isBlurred = true;
            break;
        case "ShowCalibrateScreen":
            addBlur("Calibrating...");
            addSpinnerAnimation();
            isBlurred = true;
            break;
        case "HideCalibrateScreen":
            isBlurred = false;
            removeSpinnerAnimation();
            addCheckmark();

            // timeout allows checkmark to load
            setTimeout(() => {
                removeBlur();
            }, 1500);
            // create variables for timers, or arbitrary numbers
            // hideCalibrateScreenTimer
            break;
        case "AlertSlouch":
            sendNotification("You are slouching");
            break;
        case "ZoomScreen":
            //If user is leaning forward to see the screen, zooming in will make it easier to see from a healthier position
            sendNotification("Scoot Back")
            if (isZoomEnabled) {
                if (Math.sqrt((request.new.height * request.new.width) / (request.old.width * request.old.width)) > pastNum || pastNum === null) {
                    console.log(Math.sqrt((request.new.height * request.new.width) / (request.old.width * request.old.width)));
                    pastNum = Math.sqrt((request.new.height * request.new.width) / (request.old.width * request.old.width))
                    document.body.style.zoom = 100 * Math.sqrt((request.new.height * request.new.width) / (request.old.width * request.old.width)) + "%";
                }
            }
            break;
        case "ZoomEnabled":
            isZoomEnabled = true;
            break;
        case "ZoomDisabled":
            isZoomEnabled = false;
            break;
        case "ResetZoom":
            pastNum = null;
            break;
        default:
            console.log("Invalid Request Type");
    }
});

function setupVid() {
    // sets up video element
    video.autoplay = true;
    video.style.display = "none";

    //Getting the video element, first checking if the user has an accessible webcam
    m_Stream = navigator.mediaDevices.getUserMedia({ //Get webcam stream
        video: true
    });

    m_Stream.then((stream) => { //set video elemnt's src to the webcam stream
        video.srcObject = stream;
        let vidTrack = stream.getVideoTracks()[0];
        video.width = vidTrack.getSettings().width;
        video.height = vidTrack.getSettings().height;
    }).catch((e) => {
        console.error(e);
    });

    document.body.appendChild(video);
}

/**
 * Creates a new div to move current webpage html into
 * Creates a new div to append video and text
 * Blurs the current webpage
 */
function addBlur(onScreenText, shouldFade) {
    divContainer = document.createElement("div");
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

    let video = document.createElement('video');
    video.autoplay = true;
    video.style.display = "inherit";
    video.style.width = "450px";
    video.style.height = "450px";
    video.style.borderRadius = "350px";

    m_Stream.then(function (stream) { //set video elemnt's src to the webcam stream
        video.srcObject = stream;
        let vidTrack = stream.getVideoTracks()[0];
        video.width = vidTrack.getSettings().width;
        video.height = vidTrack.getSettings().height;
        video.style.width = `${video.width}px`;
        video.style.height = `${video.height}px`;
    });
    divContainer.insertBefore(video, para);

    // video attached to divContainer, attached to webpage
    document.body.appendChild(divContainer);
    if (shouldFade) {
        fadeIn(divContainer).then(() => {

        });
    } else {

    }
}

/**
 * Adds check to the top of the video stream when necessary
 */
function addCheckmark() {
    let img = document.createElement('img');
    //gets image from an online source
    img.src = "https://github.com/mmattikalli/webExtension/blob/master/images/windowsCheck.png?raw=true";

    //sets image dimensions to smaller than the video
    img.style.width = "350px";
    img.style.height = "350px";
    img.style.zIndex = "100000001";
    img.style.position = "fixed";

    img.style.top = "50%";
    img.style.left = "50%";
    img.style.right = "50%";
    img.style.bottom = "50%";
    img.style.transform = "translate(-50%, -50%)";

    fadeIn(img);

    if (divContainer) {
        divContainer.appendChild(img);
    }
}

/**
 * Function removing both the check and the blur
 */
function removeBlur(shouldFade) {
    let container = divContainer;

    divContainer = null;
    if (shouldFade) {
        return fadeOut(container).then(() => {
            container.remove();
        });
    } else {
        container.remove();
        return Promise.resolve();
    }

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

function addSpinnerAnimation() {
    // creates spinner
    let spinnerDiv = document.createElement("div");

    spinnerDiv.class = "spinner";
    spinnerDiv.id = "spinnerDiv";

    spinnerDiv.style.position = "fixed";

    spinnerDiv.style.top = "32%";
    spinnerDiv.style.left = "40%";
    spinnerDiv.style.right = "50%";
    spinnerDiv.style.bottom = "50%";
    spinnerDiv.style.transform = "translate(-50%, -50%)";

    spinnerDiv.style.width = "300px";
    spinnerDiv.style.height = "300px";
    spinnerDiv.style.margin = "0";
    spinnerDiv.style.background = "transparent";
    spinnerDiv.style.borderTop = "4px solid #03A9F4";
    spinnerDiv.style.borderRight = "4px solid transparent";
    spinnerDiv.style.borderRadius = "50%";
    spinnerDiv.style.animation = "2s spin linear infinite";
    spinnerDiv.style.zIndex = "10000000003";

    let cssAnimation = document.createElement('style');
    cssAnimation.id = "cssAnimation";
    cssAnimation.type = 'text/css';

    // adds keyframe as a string
    let keyframeCSS = document.createTextNode('@keyframes spin {' +
        'from { transform: rotate(0deg) } ' +
        'to { transform: rotate(360deg) }' + '}');

    cssAnimation.appendChild(keyframeCSS);
    // adds style and spinner to divContainer
    divContainer.appendChild(cssAnimation);
    divContainer.appendChild(spinnerDiv);
}


function removeSpinnerAnimation() {
    let appendedSpinner = document.getElementById('spinnerDiv');
    divContainer.removeChild(appendedSpinner);
}


// mutation observer for security
var observer = new MutationObserver(function (mutations, observer) {
    // executes when a mutation occurs
    //For each mutationRecord, check if style was changed or a DOM element was removed
    mutations.forEach(function (mutationRecord) {
        if (isBlurred && mutationRecord.type === "attributes") { //style
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
        }
        if (isBlurred && mutationRecord.type === "childList") { //DOM element removed
            mutationRecord.removedNodes.forEach(function (node) {
                if (node.nodeName !== "CANVAS") {
                    if (node.nodeName === "DIV") {
                        node.childNodes.forEach(function (childNode) {
                            if (childNode.nodeName === "VIDEO") {
                                document.body.appendChild(divContainer);
                                m_Stream.then((stream) => { //set video elemnt's src to the webcam stream
                                    let video = divContainer.querySelector('video');
                                    console.log(video);
                                    video.srcObject = stream;
                                    let vidTrack = stream.getVideoTracks()[0];
                                    video.width = vidTrack.getSettings().width;
                                    video.height = vidTrack.getSettings().height;
                                    video.play();
                                }).catch((e) => {
                                    console.error(e);
                                });
                            }
                        });
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


//Add a way to not over spam notifications
//Fix math for face zoom
//Help jacob on narrator
function sendNotification(message) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }
    else if (Notification.permission === "granted") { // Let's check whether notification permissions have already been granted
        // If it's okay let's create a notification
        if (Date.now() > lastNotificationTime + TIME_BETWEEN_NOTIFICATIONS) {
            var notification = new Notification(message);
            lastNotificationTime = Date.now();
        }
    }
    else if (Notification.permission !== "denied") { // Otherwise, we need to ask the user for permission
        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                if (Date.now() > lastNotificationTime + TIME_BETWEEN_NOTIFICATIONS) {
                    var notification = new Notification(message, { body: "To protect the integrity of your back and neck, we recommend you return to your calibrated position or go for a walk" });
                    lastNotificationTime = Date.now();
                }
            }
        });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
}
