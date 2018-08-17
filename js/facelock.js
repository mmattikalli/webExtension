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
                browser.tabs.sendMessage(tab, { type: 'Unblur' });
            } else if (!foundMatch && !this.locked) {
                this.locked = true;
                browser.tabs.sendMessage(tab, { type: 'Blur' });
            }
        });
    }

    onTabActivated(tab) {
        if (this.locked) {
            // If the browser is locked, show the lock screen
            browser.tabs.sendMessage(tab, { type: 'Blur' });
        }
    }

    onTabDeactivated(tab) {
        if (this.locked) {
            // If the browser is locked, hide the lock screen
            browser.tabs.sendMessage(tab, { type: 'Unblur' });
        }
    }
}

/**
 * @type {FaceLockEventHandler}
 */
let g_FaceLockEventHandler = null;

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
