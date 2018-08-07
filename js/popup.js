document.addEventListener("DOMContentLoaded", () => {
    let faceSwitch = document.getElementById("faceSwitch");
    let faceCheckbox = faceSwitch.querySelector('input');

    // Enable the switch if face lock is enabled.
    browser.runtime.sendMessage({ type: 'IsLockEnabled' }, enabled => {
        faceCheckbox.checked = enabled;
    });

    faceCheckbox.addEventListener('click', () => {
        browser.runtime.sendMessage({ type: 'IsLockEnabled' }, enabled => {
            if (enabled) {
                browser.runtime.sendMessage({ type: 'DisableLock' });
            } else {
                browser.runtime.sendMessage({ type: 'EnableLock' });
            }
        });
    });
});
