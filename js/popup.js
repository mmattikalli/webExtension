document.addEventListener("DOMContentLoaded", () => {
    let faceSwitch = document.getElementById("faceSwitch");
    let faceCheckbox = faceSwitch.querySelector('input');

    let slouchSwitch = document.getElementById("slouchSwitch");
    let slouchCheckbox = slouchSwitch.querySelector('input');

    let extendedItemThree = document.getElementById("item3Extended");
    let zoomSwitch = document.getElementById("zoomSwitch");
    extendedItemThree.style.display = "none";
    let zoomCheckbox = zoomSwitch.querySelector('input');

    // Enable the switch if face lock is enabled.
    browser.runtime.sendMessage({ type: 'IsLockEnabled' }, enabled => {
        faceCheckbox.checked = enabled;

        browser.runtime.sendMessage({ type: 'IsLocked' }, locked => {
            faceCheckbox.disabled = locked;
        });
    });

    browser.runtime.sendMessage({ type: 'IsSlouchEnabled' }, enabled => {
        if (enabled) {
            slouchCheckbox.checked = enabled;
            extendedItemThree.style.display = "inline-block";
        } else {
            extendedItemThree.style.display = "none";
        }
    });

    browser.runtime.sendMessage({ type: 'IsZoomEnabled' }, enabled => {
        zoomCheckbox.checked = enabled;
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
            if (enabled) {
                browser.runtime.sendMessage({ type: 'DisableSlouch' });
                extendedItemThree.style.display = "none";
            } else {
                browser.runtime.sendMessage({ type: 'EnableSlouch' });
                alert('You have enabled Slouch Detection!');
                extendedItemThree.style.display = "inline-block";
            }
        });
    });

    zoomCheckbox.addEventListener('click', () => {
        browser.runtime.sendMessage({ type: 'IsZoomEnabled' }, enabled => {
            if (enabled) {
                browser.runtime.sendMessage({ type: 'ToggleZoom', state: false });
            } else {
                browser.runtime.sendMessage({ type: 'ToggleZoom', state: true });
            }
        });
    });

    // Calibrate button
    document.getElementById('calibrate').addEventListener('click', () => {
        browser.runtime.sendMessage({ type: 'Recalibrate' });
    });

    setInterval(() => {
        browser.runtime.sendMessage({ type: 'IsLocked' }, locked => {
            faceCheckbox.disabled = locked;
        });
    }, 500);
});
