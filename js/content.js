var counter = 0;
let canvas = document.createElement("canvas");
canvas.style.display = "none";

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

//Listener that appends a video element with webcam stream as src
browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(request.type);
        switch (request.type) {
            case 'StartCapture':
                var video = document.createElement("video"); //Creates element to be appended

                //Setting up video element
                video.autoplay = true;
                video.id = "vid";
                video.style.width = "320px";
                video.style.height = "240px";
                video.style.position = "fixed";
                video.style.bottom = "10px";
                video.style.left = "10px";
                video.style.borderRadius = "5px";
                video.style.zIndex = "10000000000";
                document.body.appendChild(video);

                //Getting the video element, first checking if the user has an accessible webcam
                if (navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ //Get webcam stream
                        video: true
                    }).then(function (stream) { //set video elemnt's src to the webcam stream
                        var video = document.getElementById('vid');
                        video.srcObject = stream;
                    }).catch(function (e) { console.log(e); }) //error catch
                }
                break;
            case "EndCapture":
                document.body.removeChild(document.getElementById("vid"));
                break;
            case "GetFrame":
                if (document.getElementById("vid")) {
                    sendResponse(captureFrame(document.getElementById("vid"), canvas));
                } else {
                    console.log("No webcam stream available");
                }
                break;
            case "Unblur":
                break;
            case "Blur":
                break;
            case "ShowCalibrateScreen":
                break;
            case "HideCalibrateScreen":
                break;
            default:
                console.log("Invalid Request Type");
        }
    }
);

// let isBlurred = false;

// // content script recieves message from background to perform an action 
// if (window.location.href == "https://www.wikipedia.org/") {
//     document.body.style.filter = "blur(20px)";
// }