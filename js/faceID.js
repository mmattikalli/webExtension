let captured = false;
let video = document.getElementById('video'); //THis is used when face tracking is off and only the webcam is being instantiated
let trackingCanvas = document.querySelector('.canvas2'); //tracking canvas

let mediaStream; //stores stream object
let calibrated; //calibrated image
let current; //current image
let faceCalibrated; //calibrated face ID
let counter = 0; //defines what will be considered calibrated - when counter = 0 - and when current - not 0


let faceJS = new FaceJS(AZURE_KEYS.key1, "westcentralus"); //Declaration of new wrapper object

let ticker; //initializes var for interval of snapshots 




let processImage = (image) => { //process an image (get a JSON file)
    //console.log(image); //test

    var sourceImageUrl = image

    //All this converts png to Uint8Array to send to Azure
    var data = sourceImageUrl.split(',')[1];

    var bytes = window.atob(data);
    var buf = new ArrayBuffer(bytes.length);
    var byteArr = new Uint8Array(buf);

    for (var i = 0; i < bytes.length; i++) {
        byteArr[i] = bytes.charCodeAt(i);
    }
    //wrapper class version of above REST call
    return faceJS.detectFaces(byteArr, true, true).then(text => {
        /*
        this.setState({
            jsonResponse: JSON.stringify(text)
        }); */
        let id = text[0].faceId;
        return id;
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

function sendToProcess(snapshot, calibrate) {
    if (calibrate === "calibrating" & counter < 1) {
        //if first capture click, get a calibrated face ID
        
        calibrated = snapshot;
        processImage(calibrated).then(id => {
            faceCalibrated = id;
        });
        console.log("issavingstatement");
    } else { //otherwise get a current face ID
        console.log("savingstatement2");
        current = snapshot;
        processImage(current).then(id => {
            console.log("reaching process image");
            faceJS.verifyFace(faceCalibrated, id).then(text => {
                console.log(JSON.stringify(text));
            });
        });
    }
    counter++; //increment counter after each call
}


//when the button is clicked, execute this method 
//encompasses all face tracking 
document.querySelector('.calibrate').addEventListener('click', () => {
    //Starting Webcam without using face tracking
    if (counter < 1) {
        capture("calibrating");
        counter = 1;
        ticker = setInterval(() => {
            console.log("ticking");
            capture("current");
        }, 8000);
    } else {

    }
});


document.getElementById('enableFaceIdScreen').addEventListener('click', () => {
    console.log("reaching second click"); 
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            video: true
        }).then(function (stream) {
            mediaStream = stream;
            video.src = window.URL.createObjectURL(stream);
            video.play();
        });
    }
})
