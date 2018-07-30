var btn = document.createElement("BUTTON");
var txt = document.createTextNode("michael_click");
var image = document.createElement("img");
var video = document.createElement("video");

video.autoplay = true;
video.id = "vid";
video.style.width = "640px";
video.style.height = "480px";

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

btn.addEventListener('click', function () {
    chrome.runtime.sendMessage({
        greeting: "Greeting from the content script"
    }).then(function (message) {
        console.log(`Message from the background script:  ${message.response}`);
    }).catch(function (error) {
        console.log(`Error: ${error}`);
    });
});


