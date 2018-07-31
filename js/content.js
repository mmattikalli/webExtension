var btn = document.createElement("BUTTON");
var txt = document.createTextNode("michael_click");
var image = document.createElement("img");
var video = document.createElement("video");

video.autoplay = true;
video.id = "vid";
video.style.width = "320px";
video.style.height = "240px";
video.style.position = "fixed";
video.style.bottom = "10px";
video.style.left = "10px";
video.style.borderRadius = "5px";
//video.style.display = "none";

btn.style.position = "fixed";
btn.style.bottom = "10px";
btn.style.left = "10px";

btn.appendChild(txt);
// document.body.appendChild(image);
document.body.appendChild(btn);
btn.addEventListener("click", function () {
    document.body.appendChild(video);
    console.log("hola");
    console.log(navigator.mediaDevices.getUserMedia);
    if (navigator.mediaDevices.getUserMedia) {
        //dfghjk
        console.log(navigator.platform);
        //console.log(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia({
            video: true
        }).then(function (stream) {
            console.log("made it through");
            var video = document.getElementById('vid');
            video.srcObject = stream;
            // video.onloadedmetadata = function (e) {
            //     video.play();
            // }
        }).catch(function (e) { console.log(e); })
    }


});


function handleResponse(message) {
    alert(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
    alert(`Error: ${error}`);
}

function notifyBackgroundPage(e) {
    browser.runtime.sendMessage({
        greeting: "hola"
    }, handleResponse);
    //sending.then(handleResponse, handleError);
}

btn.addEventListener("click", notifyBackgroundPage);