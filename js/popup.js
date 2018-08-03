document.addEventListener("DOMContentLoaded", () => {
    let faceSwitch = document.getElementById("faceSwitch");

    // Enable the switch if face lock is enabled.
    browser.runtime.sendMessage({ type: 'IsLockEnabled' }, enabled => {
        let checkbox = faceSwitch.querySelector('input');
        checkbox.checked = enabled;
    });

    faceSwitch.onclick = () => {
        browser.runtime.sendMessage({ type: 'IsLockEnabled' }, enabled => {
            if (enabled) {
                setTimeout(() => {
                    browser.runtime.sendMessage({ type: 'DisableLock' });
                }, 700);
            } else {
                setTimeout(() => {
                    browser.runtime.sendMessage({ type: 'EnableLock' });
                }, 700);
            }
        });
    }
});
