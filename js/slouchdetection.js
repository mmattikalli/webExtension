/// <reference path="apiKeys.js" />
/// <reference path="cameracontroller.js" />
/// <reference path="face.js" />

class SlouchDetectEventHandler extends CameraControllerEventHandler {
    onFrame(frame, tab, faces) {
        if (faces.length > 0) {
            console.log(JSON.stringify(faces));
            if (slouchDetect(faces)) {
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
        if (faces[0].faceRectangle.height > 250 || faces[0].faceRectangle.width > 250) {
            console.log("big face");
            return true;
        } else if (faceCenter.y - calibratedFaceCenter.y > 30) {
            console.log("bad back");
            return true;
        }
    }
    return false;
}