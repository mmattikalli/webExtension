let isBlurred = false;
let counter = 0;

let canvas = document.createElement("canvas"); //Pre-load the Canvas for capturing
canvas.style.display = "none";

let video = document.createElement("video"); //Pre-load the video

let newWebsiteDiv = document.createElement("div");

/**
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 *
 * @returns {Uint8Array}
 */
function captureFrame(video, canvas) {
    canvas.width = 1000;
    canvas.height = 1000;
    console.log(canvas.width);
    console.log(canvas.height);

    document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(video, 0, 0, 1000, 1000);

    // convert the canvas to a base64-encoded png file
    let data = canvas.toDataURL('image/png').split(',')[1];
    document.body.removeChild(canvas);

    let bytes = atob(data);
    let buffer = new ArrayBuffer(bytes.length);
    let byteArr = new Uint8Array(buffer);

    for (let i = 0; i < bytes.length; i++) {
        byteArr[i] = bytes.charCodeAt(i);
    }

    return byteArr;
}

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

                setupVid();

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
            case "EndCapture": //Does it by itself
                console.log("Capture Ended");
                document.body.removeChild(document.getElementById("vid"));
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
                document.body.removeChild(video);
                video.style.display = "inherit";
                addBlur("Calibrating...");
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
            case "HideCalibrateScreen":
                isBlurred = false;
                console.log("hiding calibration screen");
                removeBlur();
                setupVid();
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
    //video.style.display = "none";
    video.style.width = "1000px";
    video.style.height = "1000px";
    video.style.borderRadius = "350px";
    video.style.zIndex = "21434536743436566";

    document.body.appendChild(video);
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
    newWebsiteDiv.style.display = "none";
    document.body.innerHTML = newWebsiteDiv.innerHTML;
}

// //Create mutation observer
// var observer = new MutationObserver(function (mutations, observer) {
//     // fired when a mutation occurs
//     console.log(mutations[0].type, observer);
//     if (isBlurred && mutations[0].type === "attributes") {
//         newWebsiteDiv.style.filter = "blur(20px)";
//     }

//     if (isBlurred && mutations[0].type === "childList") {
//         if (mutations[0].removedNodes) {
//             mutations[0].removedNodes.forEach(removed => {
//                 console.log("adding removed");
//                 document.body.appendChild(removed);
//             });
//         }
//     }
// });

// //tell oberver what to observe
// observer.observe(
//     document,
//     {
//         attributes: true,
//         attributeOldValue: true,
//         childList: true,
//         subtree: true
//     }
// );