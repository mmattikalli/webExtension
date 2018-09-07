/// <reference path="apiKeys.js" />
/// <reference path="cameracontroller.js" />
/// <reference path="face.js" />

class FaceLockEventHandler extends CameraControllerEventHandler {
    constructor() {
        super();
        this.faceJs = new FaceJS(AZURE_KEYS.keys[0], AZURE_KEYS.region);
        this.calibratedId = null;
        this.locked = false;
    }

    onCalibration(frame, tab, faceInfo) {
        this.calibratedId = faceInfo.faceId;
    }

    onFrame(frame, tab, detectedFaces) {
        let verifyPromises = detectedFaces.map(face => {
            return this.faceJs.verifyFace(this.calibratedId, face.faceId).then(response => {
                if (response.error) {
                    console.error(response.error);
                }

                return response;
            });
        });

        Promise.all(verifyPromises).then(verifyResults => {
            let foundMatch = false;

            verifyResults.forEach(result => {
                if (result.isIdentical) {
                    foundMatch = true;
                }
            });

            if (foundMatch && this.locked) {
                this.locked = false;
                chrome.tabs.sendMessage(tab, { type: 'Unblur', shouldFade: true });
            } else if (!foundMatch && !this.locked) {
                this.locked = true;
                chrome.tabs.sendMessage(tab, { type: 'Blur', shouldFade: true });
            }
        });
    }

    onTabActivated(tab) {
        if (this.locked) {
            // If the browser is locked, show the lock screen
            chrome.tabs.sendMessage(tab, { type: 'Blur', shouldFade: false });
        }
    }

    onTabDeactivated(tab) {
        if (this.locked) {
            // If the browser is locked, hide the lock screen
            chrome.tabs.sendMessage(tab, { type: 'Unblur', shouldFade: false });
        }
    }
}

/**
 * @type {FaceLockEventHandler}
 */
let g_FaceLockEventHandler = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'EnableLock': {
            if (g_FaceLockEventHandler === null) {
                g_FaceLockEventHandler = new FaceLockEventHandler();
                m_CameraController.addEventHandler(g_FaceLockEventHandler);
            }
            break;
        }
        case 'DisableLock': {
            if (g_FaceLockEventHandler !== null) {
                m_CameraController.removeEventHandler(g_FaceLockEventHandler);
                g_FaceLockEventHandler = null;
            }
            break;
        }
        case 'IsLockEnabled': {
            sendResponse(g_FaceLockEventHandler !== null);
            break;
        }
        case 'IsLocked':
            if (g_FaceLockEventHandler !== null) {
                sendResponse(g_FaceLockEventHandler.locked);
            } else {
                sendResponse(false);
            }
    }
});
