var counter = 0;

//Listener that appends a video element with webcam stream as src
browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (counter < 10 && request.type === "GetVideo") { //prevent spamming
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

            document.body.style.zIndex = "10000";
            //document.body.style.filter = "blur(20px)";

            // creates video element 
            let video = document.createElement("video");

            //creates new div for video 
            let divContainer = document.createElement("div");
            divContainer.id = "divContainer";

            // clears preset div settings 
            divContainer.style.clear = "both";

            // sets divContainer to be a flexbox
            divContainer.style.display = "flex";

            // moving elements within the divContainer using flexbox properties 
            divContainer.style.alignItems = "center";
            divContainer.style.justifyContent = "center";
            divContainer.style.flexDirection = "column";

            divContainer.style.position = "fixed";
            divContainer.style.zIndex = "100000000";
            divContainer.style.width = "100%";
            divContainer.style.height = "100%";

            divContainer.style.top = "35%";
            divContainer.style.left = "50%";
            divContainer.style.right = "50%";
            divContainer.style.bottom = "50%";
            divContainer.style.transform = "translate(-50%, -50%)";

            //Setting up video element
            video.autoplay = true;
            video.id = "vid";
            video.style.width = "450px";
            video.style.height = "450px";
            // video.style.position = "fixed";
            // video.style.top = "30%"; 
            // video.style.left = "50%"; 
            // video.style.transform = "translate(-50%, -50%)";
            video.style.borderRadius = "350px";

            divContainer.appendChild(video);

            let para = document.createElement("h1");
            para.id = "para";
            para.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            para.style.fontSize = "40px";
            para.style.textAlign = "center";
            para.innerHTML = "WebAssist FaceID Technology Calibrating...";
            divContainer.appendChild(para);

            document.body.appendChild(divContainer);


            //divContainer.style.filter = "none";

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
        }
        if (request.type == "GetVideo") //Send a response back to extension script
            sendResponse({
                type: "video"
            });

        if (request.type === "ChangeInnerHTML") {
            let para = document.getElementById("para");
            para.innerHTML = para.innerHTML.replace("WebAssist FaceID Technology Calibrating...", "Calibrated!");
        }

        counter = 1;

    }
);

let isBlurred = false;

// content script recieves message from background to perform an action 
if (window.location.href == "https://www.wikipedia.org/") {
    document.body.style.filter = "blur(20px)";
}