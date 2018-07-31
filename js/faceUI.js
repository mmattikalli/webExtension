let enableFaceID = document.getElementById('enableFaceSecurity');

// to go back to the homepage

document.addEventListener("DOMContentLoaded", function () {
    let goToHomepage = document.getElementById("faceSwitchBackwards");
    goToHomepage.onclick = function () {
        setTimeout(function () {
            // replaces current webpage with new html file
            location.replace('../html/popup.html');
        }, 700);
    }
});


/*    
    console.log("reachingClick");
    capture(); 

    if (document.body.getAttribute("class") === "normal") {
        document.body.setAttribute("class", "toBeBlurred");
    } else {
        document.body.setAttribute("class", "normal");
    }

    if (screenshot != null)
    {
        console.log("screenshotting and reaching here"); 
    }
}

// blurs and unblurs the webpage 
enableFaceID.onclick = function () {

    cssBlur = "html { filter: blur(20px); }"; 
    cssUnblur = "html { filter: blur(0px); }"; 
    if (!isBlurred) {
        console.log("inside if statement"); 
        browser.tabs.insertCSS({
            code: cssBlur
        }, () => {
            console.log('Inserted');
        });
        isBlurred = true; 
        
    } else {
        browser.tabs.removeCSS({
            code: cssUnblur
        });
    }
}

//attaches canvas to html file after copying the html
function capture() {
    html2canvas(document.body).then(function(canvas) {
        screenshot = canvas; 
        document.body.appendChild(canvas); 
    });
}

// checks if the filter is still turned to blur 
function checkforFilter() {

}
*/
