// listen for sendMessage() from content script
function handleMessage(request, sender, sendResponse) {
    console.log("Message from the content script: " +
        request.greeting);
    sendResponse({ response: "Response from background script" });
}

browser.runtime.onMessage.addListener(handleMessage);