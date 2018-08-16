/// <reference path="apiKeys.js" />
/// <reference path="cameracontroller.js" />
/// <reference path="face.js" />

class SlouchDetectEventHandler extends CameraControllerEventHandler {
    onFrame(frame, tab, faces) {
        if (faces.length > 0) {
            if (faces[0].faceRectangle !== null && (faces[0].faceRectangle.height > 250 || faces[0].faceRectangle.width > 250)) {
                browser.tabs.sendMessage(tab, { type: 'AlertSlouch' });
            }
        }
    }
}

let g_SlouchDetectionEventHandler = null;

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'EnableSlouch': {
            if (g_SlouchDetectionEventHandler === null) {
                g_SlouchDetectionEventHandler = new SlouchDetectEventHandler();
                m_CameraController.addEventHandler(g_SlouchDetectionEventHandler);
            }
            break;
        }
        case 'DisableSlouch': {
            if (g_SlouchDetectionEventHandler !== null) {
                m_CameraController.removeEventHandler(g_SlouchDetectionEventHandler);
                g_SlouchDetectionEventHandler = null;
            }
            break;
        }
        case 'IsSlouchEnabled': {
            sendResponse(g_SlouchDetectionEventHandler !== null);
            break;
        }
    }
});
