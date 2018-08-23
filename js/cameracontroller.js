/// <reference path="apiKeys.js" />
/// <reference path="face.js" />

const CAMERA_UPDATE_TIME = 2000;

class CameraControllerEventHandler {
    /**
     * @param {Uint8Array} frame
     * @param {number} tab
     * @param {object} face
     */
    onCalibration(frame, tab, face) { }

    /**
     * @param {Uint8Array} frame
     * @param {number} tab
     * @param {object[]} faces
     */
    onFrame(frame, tab, faces) { }

    /**
     * @param {number} tab
     */
    onTabActivated(tab) { }

    /**
     * @param {number} tab
     */
    onTabDeactivated(tab) { }
}
class CameraController {
    constructor() {
        this.activeTab = null;
        this.handlerList = new Set();
        this.calibrateInfo = null;
        this.calibrating = false;

        browser.tabs.query({ active: true }, tabs => {
            this.activeTab = tabs[0].id;
        });
    }

    /**
     * @param {CameraControllerHandler} handler
     */
    addEventHandler(handler) {
        this.handlerList.add(handler);

        if (this.handlerList.size === 1 && this.activeTab) {
            browser.tabs.sendMessage(this.activeTab, { type: 'StartCapture' });
        }

        if (this.activeTab) {
            handler.onTabActivated(this.activeTab);
        }

        if (this.activeTab) {
            if (!this.calibrateInfo) {
                // We don't have a calibrated face so ask the user to calibrate

                if (!this.calibrating) {
                    this.calibrating = true;
                    browser.tabs.sendMessage(this.activeTab, { type: 'ShowCalibrateScreen' });
                }
            } else {
                handler.onCalibration(this.calibrateInfo.frame, this.activeTab, this.calibrateInfo.face);
            }
        }
    }

    /**
     * @param {CameraControllerEventHandler} handler
     */
    removeEventHandler(handler) {
        if (this.handlerList.delete(handler) && this.activeTab) {
            handler.onTabDeactivated(this.activeTab);
        }

        if (this.handlerList.size === 0 && this.activeTab) {
            browser.tabs.sendMessage(this.activeTab, { type: 'EndCapture' });
            this.calibrateInfo = null;
        }
    }

    hasEventHandlers() {
        return this.handlerList.size > 0;
    }

    getEventHandlers() {
        return this.handlerList;
    }

    changeActiveTab(newTab) {
        if (this.activeTab !== null) {
            this.cleanupTab(this.activeTab);
        }

        if (newTab !== null) {
            this.setupTab(newTab);
        }

        this.activeTab = newTab;
    }

    cleanupTab(tabId) {
        if (!this.hasEventHandlers()) {
            return;
        }

        this.handlerList.forEach(handler => {
            handler.onTabDeactivated(tabId);
        });

        browser.tabs.sendMessage(tabId, { type: 'EndCapture' });
    }

    setupTab(tabId) {
        if (!this.hasEventHandlers()) {
            return;
        }

        browser.tabs.sendMessage(tabId, { type: 'StartCapture' });

        this.handlerList.forEach(handler => {
            handler.onTabActivated(tabId);
        });
    }

    getActiveTab() {
        return this.activeTab;
    }
}

let m_CameraController = new CameraController();

setInterval(faceJs => {
    if (m_CameraController.getActiveTab() && m_CameraController.hasEventHandlers()) {
        browser.tabs.sendMessage(m_CameraController.getActiveTab(), { type: 'GetFrame' }, frame => {
            let bytes = atob(frame.data); //get the image data
            let buffer = new ArrayBuffer(bytes.length);
            let byteArr = new Uint8Array(buffer);

            for (let i = 0; i < bytes.length; i++) {
                byteArr[i] = bytes.charCodeAt(i);
            }

            faceJs.detectFaces(byteArr, true, true).then(response => {
                if (response.error) {
                    console.error(response.error);
                }

                return response;
            }).then(faces => {
                if (m_CameraController.calibrating) {
                    if (faces.length > 0) {
                        m_CameraController.calibrating = false;
                        m_CameraController.calibrateInfo = { face: faces[0], frame: byteArr, dimensions: { x: frame.width, y: frame.height } }; //Send Video Dimensions
                        m_CameraController.getEventHandlers().forEach(handler => {
                            handler.onCalibration(byteArr, m_CameraController.getActiveTab(), faces[0]);
                        });

                        browser.tabs.sendMessage(m_CameraController.activeTab, { type: 'HideCalibrateScreen' });
                    }
                } else {
                    m_CameraController.getEventHandlers().forEach(handler => {
                        handler.onFrame(byteArr, m_CameraController.getActiveTab(), faces);
                    });
                }
            });
        });
    }
}, CAMERA_UPDATE_TIME, new FaceJS(AZURE_KEYS.keys[0], AZURE_KEYS.region));

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message.type);
    switch (message.type) {
        case 'Recalibrate':
            if (m_CameraController.hasEventHandlers()) {
                m_CameraController.calibrateInfo = null;
                m_CameraController.calibrating = true;
                browser.tabs.sendMessage(m_CameraController.activeTab, { type: 'ShowCalibrateScreen' });
            }
            break;
        default:
            break;
    }
});

browser.tabs.onActivated.addListener(activeTabInfo => {
    m_CameraController.changeActiveTab(activeTabInfo.tabId);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    // Only worry about when the tab is fully loaded
    if (changeInfo.status === 'complete') {
        m_CameraController.setupTab(tabId);
    }
});
