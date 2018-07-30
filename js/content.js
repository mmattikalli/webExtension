//alert("work");

var btn = document.createElement("BUTTON");
var txt = document.createTextNode("michael_click");
var image = document.createElement("img");
var video = document.createElement("video");

video.autoplay = true;
video.id = "vid";
video.style.width = "640px";
video.style.height = "480px";

// image.src = "http://eskipaper.com/images/cool-backgrounds-8.jpg";
// image.style.width = "400px";
// image.style.height = "300px";
// image.style.position = "fixed";
// image.style.bottom = "10px";
// image.style.left = "10px";

btn.style.position = "fixed";
btn.style.bottom = "10px";
btn.style.left = "10px";

btn.appendChild(txt);
// document.body.appendChild(image);
document.body.appendChild(btn);
btn.onclick = function () {
    console.log("hola");
    if (navigator.mediaDevices.getUserMedia) {
        console.log(navigator);
        console.log(navigator.mediaDevices);
        // console.log(window.navigator.mediaDevices.getUserMedia);
        navigator.mediaDevices.getUserMedia({
            video: true
        }).then(function (stream) {
            var video = document.querySelector('video');
            video.srcObject = stream;

            // video.onloadedmetadata = function (e) {
            //     video.play();
            // }
        }).catch(function (e) { console.log(err.name + ": " + err.message); })
    }
}

document.body.appendChild(video);

