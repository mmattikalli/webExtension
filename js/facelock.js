/// <reference path="apiKeys.js" />
/// <reference path="face.js" />

/**
 * @type {FaceJS}
 */
const FACEJS = new FaceJS(AZURE_KEYS.key1, 'westcentralus');

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
    switch (message.type) {
        case 'EnableLock': {
            browser.tabs.query({ active: true }, tabs => {
                browser.tabs.sendMessage(tabs[0].id, { type: 'StartCapture' });
            });

            m_LockIntervalId = setInterval(() => {
                browser.tabs.query({ active: true }, tabs => {
                    let tab = tabs[0];

                    if (m_CalibratedId === null && !m_IsCalibrating) {
                        browser.tabs.sendMessage(tab.id, { type: 'ShowCalibrateScreen' });
                    }

                    browser.tabs.sendMessage(tab.id, { type: 'GetFrame' }, frame => {
                        FACEJS.detectFaces(frame).then(response => {
                            if (reponse.length === 0) {
                                // Skip if no faces are found.
                                return;
                            }

                            if (m_CalibratedId === null) {
                                // If not calibrated, use this faceId to calibrate.
                                m_CalibratedId = response[0].faceId;
                                browser.tabs.sendMessage(tab.id, { type: 'HideCalibrateScreen' });
                                return;
                            }

                            FACEJS.verifyFace(frame).then(response => {
                                console.log(JSON.stringify(response));
                            })
                        }, error => {
                            console.error(`${error.name}: ${error.message}`);
                        });
                    });
                });
            }, 1000);
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
                browser.tabs.sendMessage(tabs[0].id, { type: 'StopCapture' });
            });
            m_LockIntervalId = null;
            m_CalibratedId = null;
            break;
        }
    }
}

browser.runtime.onMessage.addListener(facelockMessageListener);
