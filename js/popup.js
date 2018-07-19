
// get the buttons by id




// for the extension
let faceButton = document.getElementById("enableFaceId"); 

faceButton.onclick = function()
{
    console.log("reaching click");
    window.open('../html/facePopup.html', 'faceStuffOrSomething');
}

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