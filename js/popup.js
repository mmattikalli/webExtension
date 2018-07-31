
// get the buttons by id
// for the extension
//let faceButton = document.getElementById("enableFaceId");
document.addEventListener("DOMContentLoaded", function () {
    let faceSwitch = document.getElementById("faceSwitch");

    browser.runtime.sendMessage({ type: 'GetSetting', name: 'faceIdEnabled' }, enabled => {
        let checkbox = faceSwitch.querySelector('input');
        checkbox.checked = enabled;
    });

    faceSwitch.onclick = function () {
        console.log("reaching click");

        browser.runtime.sendMessage({ type: 'GetSetting', name: 'faceIdEnabled' }, enabled => {
            if (enabled) {
                // TODO: Disable face id
            } else {
                setTimeout(function () {
                    location.replace('../html/facePopup.html');
                }, 700);
            }

            browser.runtime.sendMessage({ type: 'SetSetting', name: 'faceIdEnabled', value: !enabled });
        });
    }
});


// for the second webpage
/*
let enableFace = document.getElementById("enableFaceIdScreen");

enableFaceIdScreen.onclick = function()
{
    console.log("reaching second click");
    window.open('../html/faceVidStream.html', 'secondFaceStuff');
}
*/

/* blurs a frame - needs to get the object frame from a capture method

frame.onclick = function() {
    console.log("reachingClick");
    if (document.body.getAttribute("class")==="normal")
    {
        document.body.setAttribute("class", "toBeBlurred");
    }
    else{
        document.body.setAttribute("class", "normal");
    }
}


*/
