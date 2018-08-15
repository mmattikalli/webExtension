/// <reference path="apiKeys.js" />
/// <reference path="face.js" />

const CAMERA_UPDATE_TIME = 3000;

class CameraController {
    constructor() {
        this.activeTab = null;
        this.callbackList = new Set();

        browser.tabs.query({active: true}, tabs => {
            this.activeTab = tabs[0].id;
        });
    }

    /**
     * @param {object} callback
     * @param {function(Uint8Array, number, object): void} [callback.onCalibration]
     * @param {function(Uint8Array, number, Array<object>): void} [callback.onFrame]
     * @param {function(number): void} [callback.onTabActivated]
     * @param {function(number): void} [callback.onTabDeactivated]
     */
    addListener(callback) {
        this.callbackList.add(callback);

        if (this.callbackList.size === 1 && this.activeTab) {
            browser.tabs.sendMessage(this.activeTab, { type: 'StartCapture' });
        }

        if (callback.onTabActivated && this.activeTab) {
            callback.onTabActivated(this.activeTab);
        }
    }

    /**
     * @param {object} callback
     * @param {function(Uint8Array, number, object): void} [callback.onCalibration]
     * @param {function(Uint8Array, number, Array<object>): void} [callback.onFrame]
     * @param {function(number): void} [callback.onTabActivated]
     * @param {function(number): void} [callback.onTabDeactivated]
     */
    removeListener(callback) {
        if (this.callbackList.delete(callback) && callback.onTabDeactivated && this.activeTab) {
            callback.onTabDeactivated(this.activeTab);
        }

        if (this.callbackList.size === 0 && this.activeTab) {
            browser.tabs.sendMessage(this.activeTab, { type: 'EndCapture' });
        }
    }

    hasListeners() {
        return this.callbackList.size > 0;
    }

    getListeners() {
        return this.callbackList;
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
        if (!this.hasListeners()) {
            return;
        }

        this.callbackList.forEach(callback => {
            if (callback.onTabDeactivated) {
                callback.onTabDeactivated(tabId);
            }
        });

        browser.tabs.sendMessage(tabId, { type: 'EndCapture' });
    }

    setupTab(tabId) {
        if (!this.hasListeners()) {
            return;
        }

        browser.tabs.sendMessage(tabId, { type: 'StartCapture' });

        this.callbackList.forEach(callback => {
            if (callback.onTabActivated) {
                callback.onTabActivated(tabId);
            }
        });
    }

    getActiveTab() {
        return this.activeTab;
    }
}

let m_CameraController = new CameraController();

setInterval((faceJs) => {
    if (m_CameraController.getActiveTab() && m_CameraController.hasListeners()) {
        browser.tabs.sendMessage(m_CameraController.getActiveTab(), { type: 'GetFrame' }, frame => {
            let bytes = atob(frame);
            let buffer = new ArrayBuffer(bytes.length);
            let byteArr = new Uint8Array(buffer);

            for (let i = 0; i < bytes.length; i++) {
                byteArr[i] = bytes.charCodeAt(i);
            }

            m_CameraController.detectFaces(byteArr, true, true).then(faces => {
                if (faces.error) {
                    console.error(faces.error);
                }

                return faces;
            }).then(faces => {
                m_CameraController.getListeners().forEach(callback => {
                    if (callback.onFrame) {
                        callback.onFrame(byteArr, m_CameraController.getActiveTab(), faces);
                    }
                });
            });
        });
    }
}, CAMERA_UPDATE_TIME, new FaceJS(AZURE_KEYS.keys[0], AZURE_KEYS.region));

browser.tabs.onActivated.addListener(activeTabInfo => {
    m_CameraController.changeActiveTab(activeTabInfo.tabId);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    // Only worry about when the tab is fully loaded
    if (changeInfo.status === 'complete') {
        m_CameraController.setupTab(tabId);
    }
});
