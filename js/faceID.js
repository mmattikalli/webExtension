let captured = false; // Make local
let video = document.getElementById('video'); // THis is used when face tracking is off and only the webcam is being instantiated
let trackingCanvas = document.querySelector('.canvas2'); //tracking canvas

let calibratedId; // calibrated face ID
let counter = 0; // defines what will be considered calibrated - when counter = 0 - and when current - not 0

let faceJS = new FaceJS(AZURE_KEYS.key1, "westcentralus"); // Declaration of new wrapper object

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

//captures a frame of a stream
function capture(mode) {
    // add canvas element
    let canvas = document.createElement('canvas');

    // set canvas dimensions to video ones to not truncate picture
    const videoElement = document.querySelector('video');
    canvas.width = videoElement.width;
    canvas.height = videoElement.height;

    // copy full video frame into the canvas
    document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);

    // get image data URL and remove canvas
    let snapshot = canvas.toDataURL('image/png');
    canvas.parentNode.removeChild(canvas);

    // update grid picture source
    document.querySelector('#grid').setAttribute('src', snapshot);

    sendToProcess(snapshot, mode);
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

    // get image data URL and remove canvas
    canvas.parentNode.removeChild(canvas);

    let url = canvas.toDataURL('image/png');

    var data = url.split(',')[1];

    var bytes = window.atob(data);
    var buf = new ArrayBuffer(bytes.length);
    var byteArr = new Uint8Array(buf);

    for (var i = 0; i < bytes.length; i++) {
        byteArr[i] = bytes.charCodeAt(i);
    }

    return byteArr;
}

function sendToProcess(snapshot, calibrate) {
    if (calibrate === "calibrating") {
        //if first capture click, get a calibrated face ID

        processImage(snapshot).then(id => {
            calibratedId = id;
        });
        console.log("issavingstatement");
    } else { //otherwise get a current face ID
        console.log("savingstatement2");
        processImage(snapshot).then(id => {
            console.log("reaching process image");
            faceJS.verifyFace(calibratedId, id).then(text => {
                console.log(JSON.stringify(text));
            });
        });
    }
}


//when the button is clicked, execute this method
//encompasses all face tracking
document.querySelector('#calibrate').addEventListener('click', () => {
    //Starting Webcam without using face tracking
    if (counter < 1) {
        faceJS.detectFaces(captureFrame(video), true)
        .then(faces => {
            calibratedId = faces[0].faceId;
        });

        // capture("calibrating");
        counter = 1;
        setInterval(() => {
            // console.log("ticking");
            // capture("current");

            faceJS.detectFaces(captureFrame(video), true)
            .then(faces => {
                for (face in faces) {
                    faceJS.verifyFace(calibratedId, face.faceId)
                    .then()
                }
            });
        }, 8000);
    }
});


document.getElementById('enableFaceIdScreen').addEventListener('click', () => {
    console.log("reaching second click");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            video: true
        }).then(function (stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
        });
    }
})



// goes back to homepage
document.addEventListener("DOMContentLoaded", function () {
    let faceSwitchBack = document.getElementById("faceSwitchBackwards");

    faceSwitchBack.onclick = function(){
        console.log("reaching click");
        setTimeout(function() {
            location.replace('../html/popup.html');
        }, 700);
    }
});
