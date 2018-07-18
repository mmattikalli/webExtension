
// get the buttons by id
let red = document.getElementById('changeToRed');
let blue = document.getElementById('changeToBlue');
let reset = document.getElementById('reset');
let faceIDInfo = document.getElementByID('faceSwitch'); 



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




// red
red.onclick = function() {
  browser.tabs.insertCSS({code: ".c-uhfh .brand-neutral { background: red !important; }"});
};

// blue
blue.onclick = function() {
  browser.tabs.insertCSS({code: ".c-uhfh .brand-neutral { background: blue !important; }"});
};

// back to original
reset.onclick = function() {
  browser.tabs.insertCSS({code: ".c-uhfh .brand-neutral { background: #2f2f2f !important; }"});
};