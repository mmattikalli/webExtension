document.addEventListener("DOMContentLoaded", () => {
    let faceSwitch = document.getElementById("faceSwitch");
    let faceCheckbox = faceSwitch.querySelector('input');

    let slouchSwitch = document.getElementById("slouchSwitch");
    let slouchCheckbox = slouchSwitch.querySelector('input');

    // Enable the switch if face lock is enabled.
    browser.runtime.sendMessage({ type: 'IsLockEnabled' }, enabled => {
        faceCheckbox.checked = enabled;
    });

    browser.runtime.sendMessage({ type: 'IsSlouchEnabled' }, enabled => {
        slouchCheckbox.checked = enabled;
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

    slouchCheckbox.addEventListener('click', () => {
        browser.runtime.sendMessage({ type: 'IsSlouchEnabled' }, enabled => {
            console.log(enabled);
            if (enabled) {
                browser.runtime.sendMessage({ type: 'DisableSlouch' });
            } else {
                browser.runtime.sendMessage({ type: 'EnableSlouch' });
            }
        });
    });
});
