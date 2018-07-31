var counter = 0;
var btn = document.createElement("BUTTON");
var txt = document.createTextNode("michael_click");
var image = document.createElement("img");
// var video = document.createElement("video");

// video.autoplay = true;
// video.id = "vid";
// video.style.width = "320px";
// video.style.height = "240px";
// video.style.position = "fixed";
// video.style.bottom = "10px";
// video.style.left = "10px";
// video.style.borderRadius = "5px";
// video.style.zIndex = "10000000000";

//video.style.display = "none";

btn.style.position = "fixed";
btn.style.bottom = "10px";
btn.style.left = "10px";
btn.style.zIndex = "100000000";

btn.appendChild(txt);
// document.body.appendChild(image);
//document.body.appendChild(btn);
// btn.addEventListener("click", function () {
//     document.body.appendChild(video);
//     console.log("hola");
//     console.log(navigator.mediaDevices.getUserMedia);
//     if (navigator.mediaDevices.getUserMedia) {
//         //dfghjk
//         console.log(navigator.platform);
//         //console.log(navigator.mediaDevices);
//         navigator.mediaDevices.getUserMedia({
//             video: true
//         }).then(function (stream) {
//             console.log("made it through");
//             var video = document.getElementById('vid');
//             video.srcObject = stream;
//             // video.onloadedmetadata = function (e) {
//             //     video.play();
//             // }
//         }).catch(function (e) { console.log(e); })
//     }


// });


// function handleResponse(message) {
//     alert(`Message from the background script:  ${message.response}`);
// }

// function handleError(error) {
//     alert(`Error: ${error}`);
// }

// function notifyBackgroundPage(e) {
//     browser.runtime.sendMessage({
//         greeting: "hola"
//     }, handleResponse);
//     //sending.then(handleResponse, handleError);
// }

// btn.addEventListener("click", notifyBackgroundPage);

browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (counter < 1) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

            var video = document.createElement("video");

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
            if (request.greeting == "hello")
                sendResponse({ farewell: "goodbye" });

            counter = 1;
        }
    }
);
let isBlurred = false;

// content script recieves message from background to perform an action 
if (window.location.href == "https://www.wikipedia.org/") {
    document.body.style.filter = "blur(20px)";
}
