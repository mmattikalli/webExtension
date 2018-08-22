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

//If the page zoom function is enabled
let isZoomEnabled = false;

//set to create a max interval between notification alerts
let time = Date.now();

const TIME_IN_BETWEEN = 10000;

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
            addSpinnerAnimation();
            isBlurred = true;
            break;
        case "HideCalibrateScreen":
            isBlurred = false;
            removeSpinnerAnimation();
            addCheckmark();

            // timeout allows checkmark to load
            setTimeout(() => {
                removeBlur().then(() => {
                    browser.runtime.sendMessage({
                        type: 'IsLockEnabled'
                    }, enabled => {
                        if (enabled) {
                            setupVid();
                        } else {
                            browser.runtime.sendMessage({
                                type: 'IsSlouchEnabled'
                            }, enabled => {
                                if (enabled) {
                                    setupVid();
                                }
                            });
                        }
                    });
                });
            }, 1500);
            // create variables for timers, or arbitrary numbers
            // hideCalibrateScreenTimer
            break;
        case "AlertSlouch":
            notifyMe("You are slouching");
            break;
        case "ZoomScreen":
            //If user is leaning forward to see the screen, zooming in will make it easier to see from a healthier position
            notifyMe("Scoot Back")
            if (isZoomEnabled) {
                if (((video.width - request.old.width) / (video.width - request.new.width)) > pastNum || pastNum === null) {
                    pastNum = ((video.width - request.old.width) / (video.width - request.new.width));
                    document.body.style.zoom = 100 * ((video.width - request.old.width) / (video.width - request.new.width)) + "%";
                }
            }
            break;
        case "ZoomEnabled":
            isZoomEnabled = true;
            break;
        case "ZoomDisabled":
            isZoomEnabled = false;
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

    // video attached to divContainer, attached to webpage
    document.body.appendChild(divContainer);
    fadeIn(divContainer).then(() => {
        video.style.display = 'inherit';
        divContainer.insertBefore(video, para);
    });
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
function removeBlur() {
    let container = divContainer;

    divContainer = null;

    return fadeOut(container).then(() => {
        container.remove();
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


//Add a way to not over spam notifications
//Fix math for face zoom
//Help jacob on narrator
function notifyMe(message) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        if (Date.now() > time + TIME_IN_BETWEEN) {
            var notification = new Notification(message);
            time = Date.now();
            console.log("new notif fired");
        }
        console.log("alert sent");
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                if (Date.now() > time + TIME_IN_BETWEEN) {
                    var notification = new Notification(message, { body: "To protect the integrity of your back and neck, we recommend you return to your calibrated position or go for a walk" });
                    time = Date.now();
                    console.log("new notif fired");
                }
            }
            console.log("alert sent");
        });
    }

    // At last, if the user has denied notifications, and you 
    // want to be respectful there is no need to bother them any more.
}