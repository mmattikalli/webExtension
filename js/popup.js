// get the buttons by id
let red = document.getElementById('changeToRed');
let blue = document.getElementById('changeToBlue');
let reset = document.getElementById('reset');
let faceIDInfo = document.getElementByID('faceSwitch'); 

function checkedBox() {
  // Get the checkbox
  var checkBox = document.getElementById("faceSwitch");
  console.log(checkBox); 
  // Get the output text
  var text = document.getElementById("text");

  // If the checkbox is checked, display the output text
  if (checkBox.checked == true){
    text.style.display = "block";
  } else {
    text.style.display = "none";
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