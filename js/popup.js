

//let faceButton = document.getElementById("enableFaceId"); 
document.addEventListener("DOMContentLoaded", function () {
    let faceSwitch = document.getElementById("faceSwitch"); 

    // opens up the window with the options for enabling faceLock 
    faceSwitch.onclick = function(){
        setTimeout(function() {
            // replaces current webpage with new html file
            location.replace('../html/facePopup.html');
        }, 700);
    }
});



