
// get the buttons by id
/* 
let faceIDInfo = document.getElementByID('faceSwitch'); 

faceIDInfo.onclick = function(){
    window.confirm("Do you want to proceed with enabling facial recognition?");
}

*/


let faceButton = document.getElementById("enableFaceId"); 

faceButton.onclick = function()
{
    console.log("reaching click");
    window.open('../html/facePopup.html', 'faceStuffORSomething');
}

/* blurs a frame - needs to get the object frame from a capture method*/ 

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
