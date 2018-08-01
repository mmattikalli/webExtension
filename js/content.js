var counter = 0;
var isBlurred = false;

//Listener that appends a video element with webcam stream as src
browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (counter < 1 && request.type === "GetVideo") { //prevent spamming
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

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

            //Send a response back to extension script
            sendResponse({ type: "video" });
            counter = 1;
        }
        if (request.type === "BlurActive" && !isBlurred) {
            document.body.style.filter = "blur(20px)";
            isBlurred = true;
        } else if (request.type === "BlurActive" && isBlurred) {
            document.body.style.filter = "blur(0px)";
            isBlurred = false;
        }
    }
);

var insertedNodes = [];
var removedNodes = [];
var observer = new MutationObserver(function (mutations) {
    if (mutations[0].removedNodes != null) {
        mutations.forEach(function (mutation) {
            for (var i = 0; i < mutation.removedNodes.length; i++) {
                console.log("removed");
                removedNodes.push(mutation.removedNodes[i]);
                console.log(removedNodes);
            }
        });
    } else if (mutations[0].addedNodes != null) {
        mutations.forEach(function (mutation) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                console.log("gottem");
                insertedNodes.push(mutation.addedNodes[i]);
                console.log(insertedNodes);
            }
        });
    }
});
observer.observe(document, { attributes: true, childList: true, subtree: true });
