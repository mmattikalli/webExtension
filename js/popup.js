
// get the buttons by id
let red = document.getElementById('changeToRed');
let blue = document.getElementById('changeToBlue');
let reset = document.getElementById('reset');
let faceIDInfo = document.getElementByID('faceSwitch'); 


function capture() {
  html2canvas($('body'),{
    onrendered: function (canvas) {                     
      var imgString = canvas.toDataURL("image/png");
      window.open(imgString);                  
  }
});
}

$("input").blur(function(){
  alert("FaceID not recognized"); 
});

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