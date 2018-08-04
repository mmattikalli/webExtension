/// <reference path="apiKeys.js" />
/// <reference path="face.js" />

/**
 * @type {FaceJS}
 */
const FACEJS = new FaceJS(AZURE_KEYS.keys[1], AZURE_KEYS.region);

/**
 * The face id of the calibrated face. Null if no face has been calibrated.
 *
 * @type {?string}
 */
let m_CalibratedId = null;

/**
 * The id of the interval that controls the lock. Null if lock is disabled.
 *
 * @type {?number}
 */
let m_LockIntervalId = null;

let m_IsCalibrating = false;

let m_IsLocked = false;

/**
 * @type {?number}
 */
let m_CurrentTab = null;

function facelockMessageListener(message, sender, sendResponse) {
    console.log(message.type);
    switch (message.type) {
        case 'EnableLock': {
            // Tell the active tab to open a video stream
            browser.tabs.query({ active: true }, tabs => {
                browser.tabs.sendMessage(tabs[0].id, { type: 'StartCapture' });
            });

            m_LockIntervalId = setInterval(() => {
                browser.tabs.query({ active: true }, tabs => {
                    let tab = tabs[0];

                    // If no id is calibrated and we arn't currently calibrating, tell the tab to show the calibration screen.
                    if (m_CalibratedId === null && !m_IsCalibrating) {
                        browser.tabs.sendMessage(tab.id, { type: 'ShowCalibrateScreen' });
                        m_IsCalibrating = true;
                    }

                    browser.tabs.sendMessage(tab.id, { type: 'GetFrame' }, frame => {
                        console.log("frame recieved");
                        FACEJS.detectFaces(frame, true).then(response => {
                            if (response.length === 0) {
                                // Skip if no faces are found.
                                return;
                            }

                            if (m_CalibratedId === null) {
                                // If not calibrated, use this faceId to calibrate.
                                console.log(JSON.stringify(response));
                                for (let i = 0; i < response.length; i++) {
                                    console.log(response[i]);
                                }
                                m_CalibratedId = response[0].faceId;
                                browser.tabs.sendMessage(tab.id, { type: 'HideCalibrateScreen' });
                                m_IsCalibrating = false;
                                return;
                            }

                            FACEJS.verifyFace(frame).then(response => {
                                console.log(JSON.stringify(response)); // TODO: send blur/unblur messages to content script
                            })
                        }, error => {
                            console.error(`${error.name}: ${error.message}`);
                        });
                    });
                });
            }, 3000);
            break;
        }
        case 'DisableLock': {
            browser.tabs.query({ active: true }, tabs => {
                m_CurrentTab = tabs[0].id;
                clearInterval(m_LockIntervalId);
                m_IsLocked = true;
                cleanupTab(m_CurrentTab);
                m_LockIntervalId = null;
                m_CalibratedId = null;
            });
            break;
        }
        case 'IsLockEnabled': {
            // The lock is enabled if the interval is not null.
            sendResponse(m_LockIntervalId !== null);
            break;
        }
    }
}

function tabSwitchHandler(activeInfo) {
    if (m_CurrentTab !== null) {
        cleanupTab(m_CurrentTab);
    }

    if (activeInfo.tabId !== null) {
        setupTab(activeInfo.tabId);
    }
    m_CurrentTab = activeInfo.tabId;
}

function setupTab(tabId) {
    if (m_LockIntervalId !== null) {
        browser.tabs.sendMessage(tabId, { type: 'StartCapture' });

        if (m_IsCalibrating) {
            browser.tabs.sendMessage(tabId, { type: 'ShowCalibrateScreen' });
        } else if (m_IsLocked) {
            browser.tabs.sendMessage(tabId, { type: 'Unblur' });
        }
    }
}

function cleanupTab(tabId) {
    console.log(m_LockIntervalId);
    console.log(m_IsCalibrating);
    console.log(m_IsLocked);
    if (m_LockIntervalId !== null) {
        if (m_IsCalibrating) {
            browser.tabs.sendMessage(tabId, { type: 'HideCalibrateScreen' });
        } else if (m_IsLocked) {
            browser.tabs.sendMessage(tabId, { type: 'Unblur' });
        }
        browser.tabs.sendMessage(tabId, { type: 'EndCapture' });
    }
}

browser.tabs.onActivated.addListener(tabSwitchHandler);
browser.runtime.onMessage.addListener(facelockMessageListener);
