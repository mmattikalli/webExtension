/// <reference path="apiKeys.js" />
/// <reference path="cameracontroller.js" />
/// <reference path="face.js" />

const FACEJS = new FaceJS(AZURE_KEYS.keys[0], AZURE_KEYS.region);

/**
 * The face id of the calibrated face. Null if no face has been calibrated.
 *
 * @type {?string}
 */
let m_CalibratedId = null;

let m_IsCalibrated = false;
let m_IsLocked = false;

const FACELOCK_CALLBACK = {
    onFrame: (frame, tab) => {
        FACEJS.detectFaces(frame).then(detectResp => {
            if (detectResp.error) {
                console.error(detectResp.error.message);
                return;
            }

            if (!m_IsCalibrated) {
                if (detectResp.length > 0) {
                    m_CalibratedId = detectResp[0].faceId;
                    m_IsCalibrated = true;
                    browser.tabs.sendMessage(tab, { type: 'HideCalibrateScreen' });
                }
            } else {
                if (detectResp.length === 0) {
                    if (!m_IsLocked) {
                        m_IsLocked = true;
                        browser.tabs.sendMessage(tab, { type: 'Blur' });
                    }
                } else {
                    FACEJS.verifyFace(m_CalibratedId, response[0].faceId).then(resp => {
                        if (resp.error) {
                            console.error(resp.error.message);
                            return;
                        }

                        if (!resp.isIdentical && !m_IsLocked) {
                            m_IsLocked = true;
                            browser.tabs.sendMessage(tab, { type: 'Blur' });
                        } else if (resp.isIdentical && m_IsLocked) {
                            browser.tabs.sendMessage(tab, { type: 'Unblur' });
                            m_IsLocked = false;
                        }
                    });
                }
            }
        });
    },
    onTabActivated: tab => {
        if (!m_IsCalibrated) {
            // If we need to calibrate, show the calibration screen.
            browser.tabs.sendMessage(tab, { type: 'ShowCalibrateScreen' });
        } else if (m_IsLocked) {
            // If the browser is currently locked, blur the tab.
            browser.tabs.sendMessage(tab, { type: 'Blur' });
        }
    },
    onTabDeactivated: tab => {
        if (!m_IsCalibrated) {
            // If we were calibrating, hide the calibration screen.
            browser.tabs.sendMessage(tab, { type: 'HideCalibrateScreen' });
        } else if (m_IsLocked) {
            // If we were locked, hide the lock screen.
            browser.tabs.sendMessage(tab, { type: 'Unblur' });
        }
    }
};

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'EnableLock': {
            m_CalibratedId = null;
            m_IsLocked = false;
            m_CameraController.addListener(FACELOCK_CALLBACK);
            break;
        }
        case 'DisableLock': {
            m_CameraController.removeListener(FACELOCK_CALLBACK);
            break;
        }
        case 'IsLockEnabled': {
            sendResponse(m_CameraController.getListeners().has(FACELOCK_CALLBACK));
            break;
        }
    }
});
