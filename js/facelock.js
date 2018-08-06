/// <reference path="apiKeys.js" />
/// <reference path="face.js" />

/**
 * @type {FaceJS}
 */
const FACEJS = new FaceJS(AZURE_KEYS.keys[0], AZURE_KEYS.region);

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
    switch (message.type) {
        case 'EnableLock': {
            browser.tabs.query({ active: true }, tabs => {
                m_CurrentTab = tabs[0].id;

                setupTab(m_CurrentTab);

                m_LockIntervalId = setInterval(() => {
                    browser.tabs.sendMessage(m_CurrentTab, { type: 'GetFrame' }, frame => {
                        FACEJS.detectFaces(frame).then(response => {
                            if (response.length === 0) {
                                // Skip if no faces are found.
                                return;
                            }

                            if (m_CalibratedId === null) {
                                // If not calibrated, use this faceId to calibrate.
                                m_CalibratedId = response[0].faceId;
                                browser.tabs.sendMessage(m_CurrentTab, { type: 'HideCalibrateScreen' });
                            } else {
                                FACEJS.verifyFace(m_CalibratedId, response[0].faceId).then(resp => {
                                    console.log(JSON.stringify(resp));
                                });
                            }
                        });
                    });
                }, 1000);
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
    if (m_CurrentTab !== null) {
        cleanupTab(m_CurrentTab);
    }

    if (activeInfo.tabId !== null) {
        setupTab(activeInfo.tabId);
    }
    m_CurrentTab = activeInfo.tabId;
}

function setupTab(tabId) {
    browser.tabs.sendMessage(tabId, { type: 'StartCapture' });

    if (m_CalibratedId === null) {
        browser.tabs.sendMessage(tabId, { type: 'ShowCalibrateScreen' });
    } else if (m_IsLocked) {
        browser.tabs.sendMessage(tabId, { type: 'Unblur' });
    }
}

function cleanupTab(tabId) {
    if (m_CalibratedId === null) {
        browser.tabs.sendMessage(tabId, { type: 'HideCalibrateScreen' });
    } else if (m_IsLocked) {
        browser.tabs.sendMessage(tabId, { type: 'Unblur' });
    }
    browser.tabs.sendMessage(tabId, { type: 'EndCapture' });
}

browser.tabs.onActivated.addListener(tabSwitchHandler);
browser.runtime.onMessage.addListener(facelockMessageListener);
