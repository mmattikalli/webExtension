var counter = 0;

//Listener that appends a video element with webcam stream as src
browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (counter < 1) { //prevent spamming
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

            let video = document.createElement("video"); //Creates element to be appended
            //let divContainer = document.createElement("div");
            //divContainer.appendChild(video);

            //document.body.appendChild(divContainer); 
            //divContainer.style.display = "flex";
            //divContainer.style.alignContent = "center"; 
            //divContainer.style.justifyContent = "center"; 

            //Setting up video element
            video.autoplay = true;
            video.id = "vid";
            video.style.width = "350px";
            video.style.height = "350px";
            video.style.position = "fixed";
            video.style.top = "30%"; 
            video.style.left = "50%"; 
            video.style.transform = "translate(-50%, -50%)";
            video.style.borderRadius = "350px";
            video.style.zIndex = "10000000000";

            document.body.appendChild(video); 
            
            //Getting the video element, first checking if the user has an accessible webcam
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ //Get webcam stream
                    video: true
                }).then(function (stream) { //set video elemnt's src to the webcam stream
                    var video = document.getElementById('vid');
                    video.srcObject = stream;
                }).catch(function (e) {
                    console.log(e);
                }) //error catch
            }
            if (request.type == "GetVideo") //Send a response back to extension script
                sendResponse({
                    type: "video"
                });

            counter = 1;
        }
    }
);

let isBlurred = false;

// content script recieves message from background to perform an action 
if (window.location.href == "https://www.wikipedia.org/") {
    document.body.style.filter = "blur(20px)";
}