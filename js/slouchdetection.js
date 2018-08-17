/// <reference path="apiKeys.js" />
/// <reference path="cameracontroller.js" />
/// <reference path="face.js" />

const LOWERED_FACE_DISTANCE = 30;

class SlouchDetectEventHandler extends CameraControllerEventHandler {
    onFrame(frame, tab, faces) {
        if (faces.length > 0) {
            if (slouchDetect(faces) === 1) {
                browser.tabs.sendMessage(tab, {
                    //Tells content script to execute script that zooms webpage in proportionally to how much closer user gets
                    type: 'ZoomScreen',
                    new: { //Get center of face in frame
                        width: faces[0].faceRectangle.width,
                        height: faces[0].faceRectangle.height
                    },
                    old: {
                        width: m_CameraController.calibrateInfo.face.faceRectangle.width,
                        height: m_CameraController.calibrateInfo.face.faceRectangle.height
                    }
                });
            } else if (slouchDetect(faces) === 2) {
                browser.tabs.sendMessage(tab, { type: 'AlertSlouch' })
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

function slouchDetect(faces) {
    let calibratedFaceCenter = {
        x: m_CameraController.calibrateInfo.face.faceRectangle.left + ((m_CameraController.calibrateInfo.face.faceRectangle.width) / 2),
        y: m_CameraController.calibrateInfo.face.faceRectangle.top + ((m_CameraController.calibrateInfo.face.faceRectangle.height) / 2)
    }

    let faceCenter = { //Get center of face in frame
        x: faces[0].faceRectangle.left + ((faces[0].faceRectangle.width) / 2),
        y: faces[0].faceRectangle.top + ((faces[0].faceRectangle.height) / 2),
    }

    if (faces[0].faceRectangle !== null) {
        if (faces[0].faceRectangle.height > 190 || faces[0].faceRectangle.width > 190) { //190s will become the calibrated face height and width
            console.log("big face");
            return 1; //If face size increases, indicating a user leaning in/slouching forward
        } else if (faceCenter.y - calibratedFaceCenter.y > LOWERED_FACE_DISTANCE) {
            console.log("bad back");
            return 2; //If center of face is lowered, indicatinga hunch in the user's back
        }
    }
    return false; //If neither of the above conditions are satisfied
}