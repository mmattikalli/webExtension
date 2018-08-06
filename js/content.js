let isBlurred = false;
let counter = 0;
let canvas = document.createElement("canvas");
canvas.style.display = "none";
let video = document.createElement("video");
video.style.display = "none";

/**
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 *
 * @returns {Uint8Array}
 */
function captureFrame(video, canvas) {
    canvas.width = video.width;
    canvas.height = video.height;

    canvas.getContext('2d').lineTo(50, 50);
    canvas.getContext('2d').drawImage(video, 0, 0);

    // convert the canvas to a base64-encoded png file
    let data = canvas.toDataURL('image/png').split(',')[1];

    let bytes = atob(data);
    let buffer = new ArrayBuffer(bytes.length);
    let byteArr = new Uint8Array(buffer);

    for (let i = 0; i < bytes.length; i++) {
        byteArr[i] = bytes.charCodeAt(i);
    }

    return byteArr;
}

let newWebsiteDiv = document.createElement("div");

//Listener that appends a video element with webcam stream as src
browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(request.type);
        switch (request.type) {
            case 'StartCapture':
                console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");

                isBlurred = true;

                video.style.display = "inherit";
                setupVid();
                addBlur("Calibrating...");

                //Getting the video element, first checking if the user has an accessible webcam
                if (navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ //Get webcam stream
                        video: true
                    }).then(function (stream) { //set video elemnt's src to the webcam stream
                        video.srcObject = stream;
                    }).catch(function (e) {
                        console.log(e);
                    }) //error catch
                }
                break;
            case "EndCapture":

                break;
            case "GetFrame":
                if (video.srcObject !== null) {
                    sendResponse(captureFrame(video, canvas));
                } else {
                    console.log("No webcam stream available");
                }
                break;
            case "Unblur":
                isBlurred = false;
                removeBlur();
                break;
            case "Blur":
                break;
            case "ShowCalibrateScreen":
                //addBlur("Calibrating...");
                break;
            case "HideCalibrateScreen":
                isBlurred = false;
                removeBlur();
                break;
            default:
                console.log("Invalid Request Type");
        }

        counter = 1;

    }
);

function setupVid() {
    // setting up video element
    video.autoplay = true;
    video.id = "vid";
    video.style.width = "450px";
    video.style.height = "450px";
    video.style.borderRadius = "350px";
    video.style.zIndex = "21434536743436566";
}

/**
 * Creates a new div to move current webpage html into
 * Creates a new div to append video and text
 * Blurs the current webpage 
 */
function addBlur(onScreenText) {
    // move all of website html into a div

    let websiteBody = document.body.innerHTML;
    document.body.innerHTML = "";

    document.body.appendChild(newWebsiteDiv);
    newWebsiteDiv.innerHTML = websiteBody;

    // sets document zindex lower than the divContainer     
    document.body.style.zIndex = "10000";

    //creates new div for video 
    let divContainer = document.createElement("div");
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
    divContainer.appendChild(video);

    // creates text to put on screen with video element 
    let para = document.createElement("h1");
    para.id = "para";
    para.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    para.style.fontSize = "40px";
    para.style.textAlign = "center";
    para.innerHTML = onScreenText;
    divContainer.appendChild(para);

    // video attached to divContainer, attached to webpage
    document.body.appendChild(divContainer);

    // blurs only the background text 
    newWebsiteDiv.style.filter = "blur(20px)";
}

function removeBlur() {
    newWebsiteDiv.style.filter = "none";
    document.body.innerHTML = newWebsiteDiv.innerHTML;
}