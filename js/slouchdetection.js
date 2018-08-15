/// <reference path="apiKeys.js" />
/// <reference path="cameracontroller.js" />
/// <reference path="face.js" />

// const FACEJS = new FaceJS(AZURE_KEYS.keys[0], AZURE_KEYS.region);

const SLOUCHDETECT_CALLBACK = {
    onFrame: (frame, tab) => {
        FACEJS.detectFaces(frame).then(detectResp => {
            if (detectResp.error) {
                console.error(detectResp.error.message);
                return;
            }

            if (detectResp.length > 0) {
                console.log(JSON.stringify(detectResp[0].faceRectangle));
                if (detectResp[0].faceRectangle !== null && (detectResp[0].faceRectangle.height > 250 || detectResp[0].faceRectangle.width > 250)) {
                    browser.tabs.sendMessage(tab, { type: 'AlertSlouch' });
                }
            }
        });
    },
    onTabActivated: tab => {
    },
    onTabDeactivated: tab => {
    }
};

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'EnableSlouch': {
            m_CameraController.addListener(SLOUCHDETECT_CALLBACK);
            break;
        }
        case 'DisableSlouch': {
            m_CameraController.removeListener(SLOUCHDETECT_CALLBACK);
            break;
        }
        case 'IsSlouchEnabled': {
            sendResponse(m_CameraController.getListeners().has(SLOUCHDETECT_CALLBACK));
            break;
        }
    }
});
