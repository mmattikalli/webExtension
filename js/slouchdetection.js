/// <reference path="apiKeys.js" />
/// <reference path="cameracontroller.js" />
/// <reference path="face.js" />

const LOWERED_FACE_DISTANCE = 30;
const TOO_BIG_FACE_SIZE = 200;
const SLOUCH_ATTRIBUTES = {
    "FORWARD_LEANING_SLOUCH": 0,
    "SLOUCH_DOWN": 1,
    "NONE": 2
};
let zoomEnabled = false; //Whether the zoom add-on is enabled

class SlouchDetectEventHandler extends CameraControllerEventHandler {
    onFrame(frame, tab, faces) {
        if (faces.length > 0) {
            switch (slouchDetect(faces)) {
                case SLOUCH_ATTRIBUTES.FORWARD_LEANING_SLOUCH:
                    browser.tabs.sendMessage(tab, {
                        //Tells content script to execute script that zooms webpage in proportionally to how much closer user gets
                        type: 'ZoomScreen',
                        new: { //Get dimensions of face in frame
                            width: faces[0].faceRectangle.width,
                            height: faces[0].faceRectangle.height
                        },
                        old: {
                            width: m_CameraController.calibrateInfo.face.faceRectangle.width,
                            height: m_CameraController.calibrateInfo.face.faceRectangle.height
                        }
                    });
                    break;
                case SLOUCH_ATTRIBUTES.SLOUCH_DOWN:
                    browser.tabs.sendMessage(tab, { type: 'AlertSlouch' });
                    break;
                default:
                    break;
            }
        }
    }
    onTabActivated(tab) {
        browser.tabs.sendMessage(tab, { type: 'ResetZoom' });
        if (zoomEnabled) {
            browser.tabs.sendMessage(tab, { type: 'ZoomEnabled' });
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
        case 'SetZoomEnabled': {
            zoomEnabled = true;
            browser.tabs.sendMessage(m_CameraController.activeTab, { type: 'ZoomEnabled' });
            break;
        }
        case 'SetZoomDisabled': {
            zoomEnabled = false;
            browser.tabs.sendMessage(m_CameraController.activeTab, { type: 'ZoomDisabled' });
            break;
        }
        case 'IsZoomEnabled': {
            sendResponse(zoomEnabled);
            break;
        }
    }
});

function slouchDetect(faces) {
    let calibratedFaceCenter = {
        x: m_CameraController.calibrateInfo.face.faceRectangle.left + ((m_CameraController.calibrateInfo.face.faceRectangle.width) / 2),
        y: m_CameraController.calibrateInfo.face.faceRectangle.top + ((m_CameraController.calibrateInfo.face.faceRectangle.height) / 2)
    }

    let faceCenter = { //Get center of face in frame
        x: faces[0].faceRectangle.left + ((faces[0].faceRectangle.width) / 2),
        y: faces[0].faceRectangle.top + ((faces[0].faceRectangle.height) / 2),
    }

    if (faces[0].faceRectangle.height > TOO_BIG_FACE_SIZE || faces[0].faceRectangle.width > TOO_BIG_FACE_SIZE) {
        return SLOUCH_ATTRIBUTES.FORWARD_LEANING_SLOUCH; //If face size increases, indicating a user leaning in/slouching forward
    } else if (faceCenter.y - calibratedFaceCenter.y > LOWERED_FACE_DISTANCE) {
        return SLOUCH_ATTRIBUTES.SLOUCH_DOWN; //If center of face is lowered, indicating a hunch in the user's back
    }
    return SLOUCH_ATTRIBUTES.NONE; //If neither of the above conditions are satisfied
}