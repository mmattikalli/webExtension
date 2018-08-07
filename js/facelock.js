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

let m_IsLocked = false;

/**
 * @type {?number}
 */
let m_CurrentTab = null;

function facelockMessageListener(message, sender, sendResponse) {
    console.log(message.type);
    switch (message.type) {
        case 'EnableLock': {
            browser.tabs.query({ active: true }, tabs => {
                m_CurrentTab = tabs[0].id;

                setupTab(m_CurrentTab);

                m_LockIntervalId = setInterval(() => {
                    browser.tabs.sendMessage(m_CurrentTab, { type: 'GetFrame' }, frame => {
                        let bytes = atob(frame);
                        let buffer = new ArrayBuffer(bytes.length);
                        let byteArr = new Uint8Array(buffer);

                        for (let i = 0; i < bytes.length; i++) {
                            byteArr[i] = bytes.charCodeAt(i);
                        }

                        FACEJS.detectFaces(byteArr).then(response => {
                            if (response.error) {
                                console.error(response.error.message);
                                return;
                            }

                            if (m_CalibratedId === null) {
                                // If not calibrated, use this faceId to calibrate.
                                if (response.length > 0) {
                                    m_CalibratedId = response[0].faceId;
                                    browser.tabs.sendMessage(m_CurrentTab, { type: 'HideCalibrateScreen' });
                                }
                            } else {
                                if (response.length === 0) {
                                    m_IsLocked = true;
                                    browser.tabs.sendMessage(m_CurrentTab, { type: 'Blur' });
                                }

                                FACEJS.verifyFace(m_CalibratedId, response[0].faceId).then(resp => {
                                    if (resp.error) {
                                        console.error(resp.error.message);
                                        return;
                                    }

                                    if (!resp.isIdentical && !m_IsLocked) {
                                        m_IsLocked = true;
                                        browser.tabs.sendMessage(m_CurrentTab, { type: 'Blur' });
                                    } else if (m_IsLocked) {
                                        browser.tabs.sendMessage(m_CurrentTab, { type: 'Unblur' });
                                        m_IsLocked = false;
                                    }
                                });
                            }
                        });
                    });
                }, 5000);
            });
            break;
        }
        case 'DisableLock': {
            clearInterval(m_LockIntervalId);
            cleanupTab(m_CurrentTab);
            m_LockIntervalId = null;
            m_CalibratedId = null;
            m_IsLocked = false;
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
    if (m_LockIntervalId === null) {
        return;
    }

    if (m_CurrentTab !== null) {
        cleanupTab(m_CurrentTab);
    }

    if (activeInfo.tabId !== null) {
        setupTab(activeInfo.tabId);
    }
    m_CurrentTab = activeInfo.tabId;
}

function tabUpdateHandler(tabId, changeInfo, tabInfo) {
    // Only setup the tab if facelock is enabled
    if (m_LockIntervalId === null) {
        return;
    }

    if (changeInfo.status === 'complete') {
        setupTab(tabId);
    }
}

/**
 * Setup a tab for capture
 * @param {number} tabId
 */
function setupTab(tabId) {
    browser.tabs.sendMessage(tabId, { type: 'StartCapture' });

    if (m_CalibratedId === null) {
        // If we need to calibrate, show the calibration screen.
        browser.tabs.sendMessage(tabId, { type: 'ShowCalibrateScreen' });
    } else if (m_IsLocked) {
        // If the browser is currently locked, blur the tab.
        browser.tabs.sendMessage(tabId, { type: 'Blur' });
    }
}

function cleanupTab(tabId) {
    if (m_CalibratedId === null) {
        // If we were calibrating, hide the calibration screen.
        browser.tabs.sendMessage(tabId, { type: 'HideCalibrateScreen' });
    } else if (m_IsLocked) {
        // If we were locked, hide the lock screen.
        browser.tabs.sendMessage(tabId, { type: 'Unblur' });
    }
    browser.tabs.sendMessage(tabId, { type: 'EndCapture' });
}

browser.tabs.onActivated.addListener(tabSwitchHandler);
browser.tabs.onUpdated.addListener(tabUpdateHandler);
browser.runtime.onMessage.addListener(facelockMessageListener);
