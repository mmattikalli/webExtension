let captured = false; // Make local
let video = document.getElementById('video'); // THis is used when face tracking is off and only the webcam is being instantiated
let trackingCanvas = document.querySelector('.canvas2'); //tracking canvas

let calibratedId; // calibrated face ID
let counter = 0; // defines what will be considered calibrated - when counter = 0 - and when current - not 0

let faceJS = new FaceJS(AZURE_KEYS.key1, "westcentralus"); // Declaration of new wrapper object

// goes back to homepage
document.addEventListener("DOMContentLoaded", function () {
    let switchBack = document.getElementById("faceSwitch");

    switchBack.onclick = function () {
        browser.runtime.sendMessage({ type: 'SetSetting', name: 'faceIdEnabled', value: false });

        setTimeout(function () {
            location.replace('../html/popup.html');
        }, 700);
    }
});

// TODO(MD): Make a named function
let processImage = (image) => { // process an image (get a JSON file)
    // All this converts png to Uint8Array to send to Azure
    var data = image.split(',')[1];

    var bytes = window.atob(data);
    var buf = new ArrayBuffer(bytes.length);
    var byteArr = new Uint8Array(buf);

    for (var i = 0; i < bytes.length; i++) {
        byteArr[i] = bytes.charCodeAt(i);
    }

    // wrapper class version of above REST call
    return faceJS.detectFaces(byteArr, true, true).then(text => {
        if (text.length < 1) {
            alert("ur face gone");
            return text[0].faceId;
        } else {
            let id = text[0].faceId;
            return id;
        }
    });
}

//stops video, clearing out the feed on the page and unloading memory
function stopVideo(stream) {
    const video = document.querySelector('video');
    video.parentNode.removeChild(video);

    // free memory before page unloading
    window.URL.revokeObjectURL(stream);
}

/**
 * Capture a single frame from a video element
 *
 * @param {HTMLVideoElement} video The video element to capture
 */
function captureFrame(video) {
    let canvas = document.createElement('canvas');

    // set canvas dimensions to video ones to not truncate picture
    canvas.width = video.width;
    canvas.height = video.height;

    // copy full video frame into the canvas
    document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(video, 0, 0, video.width, video.height);

    let url = canvas.toDataURL('image/png');
    // get image data URL and remove canvas
    canvas.parentNode.removeChild(canvas);

    var data = url.split(',')[1];

    var bytes = window.atob(data);
    var buf = new ArrayBuffer(bytes.length);
    var byteArr = new Uint8Array(buf);

    for (var i = 0; i < bytes.length; i++) {
        byteArr[i] = bytes.charCodeAt(i);
    }

    return byteArr;
}

//when the button is clicked, execute this method
//encompasses all face tracking

document.querySelector('.calibrate').addEventListener('click', () => {
    // Prevent spam clicking
    if (counter < 1) {
        faceJS.detectFaces(captureFrame(video), true)
            .then(faces => {
                calibratedId = faces[0].faceId;
            });
        counter = 1;
        setInterval(() => {
            faceJS.detectFaces(captureFrame(video), true)
                .then(faces => {
                    if (faces.length < 1) {
                        alert("ur face gone");
                    } else {
                        faces.forEach(face => {
                            console.log("itworkedtoreachforloop");
                            faceJS.verifyFace(calibratedId, face.faceId)
                                .then(result => {
                                    console.log(result);
                                });
                        });
                    }
                });
        }, 8000);
    }
});

document.getElementById("enableFaceIdScreen").addEventListener("click", () => {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { greeting: "hello" }, function (response) {
            console.log(response.farewell);
        });
    });
});