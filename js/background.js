let settings = {
    'faceIdEnabled': false,
    'slouchDetectionEnabled': false,
    'handScrollingEnabled': false,
    'objectSearchEnabled': false
};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(JSON.stringify(request));

    switch (request.type) {
        case 'GetSetting': {
            let keys = Object.keys(settings);
            if (Object.keys(settings).includes(request.name)) {
                sendResponse(settings[request.name]);
            } else {
                throw new Error(`Failed to find setting ${request.name}`);
            }
            break;
        }
        case 'SetSetting': {
            if (Object.keys(settings).includes(request.name)) {
                settings[request.name] = request.value;
            } else {
                throw new Error(`Failed to find setting ${request.name}`);
            }
            break;
        }
        default: {
            console.log('Unknown type');
            throw new Error(`Unknown request type ${request.type}`);
        }
    }
});

