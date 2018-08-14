const CAMERA_UPDATE_TIME = 3000;

class CameraController {
    constructor() {
        this.callbackList = new Set();
        this.activeTab = null;

        browser.tabs.query({active: true}, tabs => {
            this.activeTab = tabs[0].id;
        });
    }

    addListener(callback) {
        // Verify callback has functions 'onTabActivated', 'onTabDeactivated',
        // and 'onFrame'

        this.callbackList.add(callback);

        if (this.callbackList.size === 1 && this.activeTab) {
            browser.tabs.sendMessage(this.activeTab, { type: 'StartCapture' });
        }

        callback.onTabActivated(this.activeTab);
    }

    removeListener(callback) {
        callback.onTabDeactivated(this.activeTab);

        this.callbackList.delete(callback);

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
            callback.onTabDeactivated(tabId);
        });

        browser.tabs.sendMessage(tabId, { type: 'EndCapture' });
    }

    setupTab(tabId) {
        if (!this.hasListeners()) {
            return;
        }

        browser.tabs.sendMessage(tabId, { type: 'StartCapture' });

        this.callbackList.forEach(callback => {
            callback.onTabActivated(tabId);
        });
    }

    getActiveTab() {
        return this.activeTab;
    }
}

let m_CameraController = new CameraController();

setInterval(() => {
    if (m_CameraController.getActiveTab() && m_CameraController.hasListeners()) {
        browser.tabs.sendMessage(m_CameraController.getActiveTab(), { type: 'GetFrame' }, frame => {
            let bytes = atob(frame);
            let buffer = new ArrayBuffer(bytes.length);
            let byteArr = new Uint8Array(buffer);

            for (let i = 0; i < bytes.length; i++) {
                byteArr[i] = bytes.charCodeAt(i);
            }

            m_CameraController.getListeners().forEach(callback => {
                callback.onFrame(byteArr, m_CameraController.getActiveTab());
            });
        });
    }
}, CAMERA_UPDATE_TIME);

browser.tabs.onActivated.addListener(activeTabInfo => {
    m_CameraController.changeActiveTab(activeTabInfo.tabId);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    // Only worry about when the tab is fully loaded
    if (changeInfo.status === 'complete') {
        m_CameraController.setupTab(tabId);
    }
});
