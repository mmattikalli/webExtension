// div for website html
let newWebsiteDiv = document.createElement("div");
// container for video element + text 
let divContainer = document.createElement("div");


// canvas elements 
let canvas = document.createElement("canvas"); //Pre-load the Canvas for capturing
canvas.style.display = "none";

// preload the video
let video = document.createElement("video"); //Pre-load the video

// creates text element
let para = document.createElement("h1");

// creates checkmark element container (div)
let checkElement = document.createElement("div");

// creates checkmark element 
var img = document.createElement("img");
let m_Stream = null;

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
            removeBlur();
            setupVid();
            break;
        case "Blur":
            addBlur("Locked");
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
            break;
        case "ShowCalibrateScreen":
            document.body.removeChild(video);
            addBlur("Calibrating...");
            break;
        case "HideCalibrateScreen":
            addCheckmark();
            setTimeout(() => {
                removeBlur();
                setupVid();
            }, 3000);
            break;
        default:
            console.log("Invalid Request Type");
    }
});

function setupVid() {
    // setting up video element
    video.autoplay = true;
    video.style.display = "none";
    video.style.width = "450px";
    video.style.height = "450px";
    video.style.borderRadius = "350px";
    video.style.zIndex = "1000000001";

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
    // move all of website html into a div

    let websiteBody = document.body.innerHTML;
    document.body.innerHTML = "";

    document.body.appendChild(newWebsiteDiv);
    newWebsiteDiv.innerHTML = websiteBody;

    // sets document zindex lower than the divContainer
    document.body.style.zIndex = "10000";

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

    divContainer.style.top = "35%";
    divContainer.style.left = "50%";
    divContainer.style.right = "50%";
    divContainer.style.bottom = "50%";
    divContainer.style.transform = "translate(-50%, -50%)";

    // adds video to divContainer
    video.style.display = "inherit";
    divContainer.appendChild(video);

    // formats text to put on screen with video element
    para.id = "para";
    para.style.all = "initial";
    para.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    para.style.color = "black";
    para.style.fontWeight = "light";
    para.style.fontSize = "40px";
    para.style.textAlign = "center";
    para.innerHTML = onScreenText;
    divContainer.appendChild(para);

    // video attached to divContainer, attached to webpage
    fadeIn(divContainer);
    document.body.appendChild(divContainer);

    // blurs only the background text
    newWebsiteDiv.style.filter = "blur(20px)";
}

/**
 * Adds check to the top of the video stream when necessary
 */
function addCheckmark() {

    //creates image element
    
    checkElement.id = "checkElement";
    

    //gets image from an online source
    img.src = "https://cdn3.iconfinder.com/data/icons/sympletts-free-sampler/128/circle-check-512.png";

    //sets image dimensions to smaller than the video
    img.style.width = "350px";
    img.style.height = "350px";

    // appends image to checkElement container 
    checkElement.appendChild(img);

    // sets checkElement to be a flexbox
    checkElement.style.display = "flex";

    // formatting elements within the checkElement div
    checkElement.style.alignItems = "center";
    checkElement.style.justifyContent = "center";
    checkElement.style.flexDirection = "column";

    checkElement.style.position = "fixed";
    checkElement.style.zIndex = "1000000002";
    checkElement.style.width = "100%";
    checkElement.style.height = "100%";

    checkElement.style.top = "30%";
    checkElement.style.left = "50%";
    checkElement.style.right = "50%";
    checkElement.style.bottom = "50%";
    checkElement.style.transform = "translate(-50%, -50%)";

    if (checkElement) {
        fadeIn(checkElement);
        document.body.appendChild(checkElement);
    }
}

/**
 * Function removing both the check and the blur
 */
function removeBlur() {
    // fades out all three elements on webpage
    fadeOut(checkElement); 
    fadeOut(para); 
    fadeOut(divContainer);
    // resets the website after all the fading has occurred 
    setTimeout(() => {
        console.log("gettingtotimeout"); 
        newWebsiteDiv.style.filter = "none";
        document.body.removeChild(divContainer);
        document.body.innerHTML = newWebsiteDiv.innerHTML;
    }, 2000);

}

function fadeIn(element) {
    var op = 0.1; // initial opacity
    //element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1) {
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = "alpha(opacity=" + op * 100 + ")";
        op += op * 0.1;
    }, 20);
}

function fadeOut(element) {
    var op = 1; // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1) {
            clearInterval(timer);
            //element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        // slowly reduces opacity 
        op -= op * 0.1;
    }, 20);
}