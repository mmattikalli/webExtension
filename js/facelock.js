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

/**
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 *
 * @returns {Uint8Array}
 */
function captureFrame(video, canvas) {
    canvas.width = video.width;
    canvas.height = video.height;

    canvas.getContext('2d').lineTo(50, 50);
    canvas.getContext('2d').drawImage(video, 0, 0);

    // convert the canvas to a base64-encoded png file
    let data = canvas.toDataURL('image/png').split(',')[1];

    let bytes = atob(data);
    let buffer = new ArrayBuffer(bytes.length);
    let byteArr = new Uint8Array(buffer);

    for (let i = 0; i < bytes.length; i++) {
        byteArr[i] = bytes.charCodeAt(i);
    }

    return byteArr;
}

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
            clearInterval(m_LockIntervalId);
            browser.tabs.query({ active: true }, tabs => {
                if (m_IsCalibrating) {
                    browser.tabs.sendMessage(tabs[0].id, { type: 'HideCalibrateScreen' });
                } else if (m_IsLocked) {
                    browser.tabs.sendMessage(tabs[0].id, { type: 'Unblur' });
                }
                browser.tabs.sendMessage(tabs[0].id, { type: 'EndCapture' });
            });
            m_LockIntervalId = null;
            m_CalibratedId = null;
            break;
        }
        case 'IsLockEnabled': {
            // The lock is enabled if the interval is not null.
            sendResponse(m_LockIntervalId !== null);
            break;
        }
    }
}

// TODO: If the user switches tabs, start the camera stream on that tab and end it on the old one.

browser.runtime.onMessage.addListener(facelockMessageListener);
