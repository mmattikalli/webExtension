var counter = 0;
let newWebsiteDiv = document.createElement("div");

//Listener that appends a video element with webcam stream as src
browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(request.type);

        // for testing purposes
        if ("StartCapture" === request.type) {
            addBlur();
            addCheck();
            console.log(request.type);
        }
        if ("EndCapture" === request.type) {
            removeBlur();
            console.log(request.type);
        }

        if (counter < 10 && request.type === "GetVideo") { //prevent spamming
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

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
/**
 * Creates a new div to move current webpage html into
 * Creates a new div to append video and text
 * Blurs the current webpage 
 */
function addBlur() {
    // move all of website html into a div

    let websiteBody = document.body.innerHTML;
    document.body.innerHTML = "";

    document.body.appendChild(newWebsiteDiv);
    newWebsiteDiv.innerHTML = websiteBody;

    // sets document zindex lower than the divContainer     
    document.body.style.zIndex = "10000";

    // creates video element 
    let video = document.createElement("video");

    //creates new div for video 
    let divContainer = document.createElement("div");
    divContainer.id = "divContainer";

    // clears preset div settings 
    divContainer.style.clear = "both";

    // sets divContainer to be a flexbox
    divContainer.style.display = "flex";

    // formatting elements within the divContainer
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

    // setting up video element
    video.autoplay = true;
    video.id = "vid";
    video.style.width = "450px";
    video.style.height = "450px";
    video.style.borderRadius = "350px";
    video.style.zIndex = "1000000001";

    // adds video to divContainer 
    divContainer.appendChild(video);

    // creates text to put on screen with video element 
    let para = document.createElement("h1");
    para.id = "para";
    para.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    para.style.fontWeight = "light"; 
    para.style.fontSize = "40px";
    para.style.textAlign = "center";
    para.innerHTML = "Calibrating...";
    divContainer.appendChild(para);

    // video attached to divContainer, attached to webpage
    document.body.appendChild(divContainer);

    // blurs only the background text 
    newWebsiteDiv.style.filter = "blur(20px)";
}

/**
 * Adds check to the top of the video stream when necessary
 */
function addCheck() {
    let checkElement = document.createElement("div");
    var img = document.createElement("img");

    //gets image from an online source
    img.src = "https://png.icons8.com/windows/1600/0063B1/checked";

    //sets image dimensions to smaller than the video
    img.style.width = "350px";
    img.style.height = "350px";

    checkElement.appendChild(img);

    // sets checkElement to be a flexbox
    checkElement.style.display = "flex";

    // formatting elements within the checkElement div
    checkElement.style.alignItems = "center";
    checkElement.style.justifyContent = "center";
    checkElement.style.flexDirection = "column";

    checkElement.style.position = "fixed";
    checkElement.style.zIndex = "1000000002";
    checkElement.style.width = "100%";
    checkElement.style.height = "100%";

    checkElement.style.top = "35%";
    checkElement.style.left = "50%";
    checkElement.style.right = "50%";
    checkElement.style.bottom = "50%";
    checkElement.style.transform = "translate(-50%, -50%)";

    document.body.appendChild(checkElement);
}

/**
 * Function removing both the check and the blur 
 */
function removeBlur() {
    newWebsiteDiv.style.filter = "none";
    document.body.innerHTML = newWebsiteDiv.innerHTML;
}