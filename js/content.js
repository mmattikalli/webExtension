let isBlurred = false; 

// content script recieves message from background to perform an action 
if (window.location.href == "https://www.wikipedia.org/")
{
    document.body.style.filter = "blur(20px)"; 
}