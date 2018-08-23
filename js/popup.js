document.addEventListener("DOMContentLoaded", () => {
    let faceSwitch = document.getElementById("faceSwitch");
    let faceCheckbox = faceSwitch.querySelector('input');

    let slouchSwitch = document.getElementById("slouchSwitch");
    let slouchCheckbox = slouchSwitch.querySelector('input');

    let zoomSwitch = document.getElementById("zoomSwitch"); 
    let zoomCheckbox = zoomSwitch.querySelector('input');

    let calibrateButton = document.getElementById('calibrate');

    // Enable the switch if face lock is enabled.
    browser.runtime.sendMessage({ type: 'IsLockEnabled' }, enabled => {
        faceCheckbox.checked = enabled;

        browser.runtime.sendMessage({ type: 'IsLocked' }, locked => {
            faceCheckbox.disabled = locked;
        });
    });

    browser.runtime.sendMessage({ type: 'IsSlouchEnabled' }, slouchEnabled => {
        slouchCheckbox.checked = slouchEnabled;
        zoomCheckbox.disabled = !slouchEnabled; 

        //extendedItemThree.style.display = "inline-block";
        browser.runtime.sendMessage({ type: 'IsZoomEnabled' }, zoomEnabled => {
            zoomCheckbox.checked = zoomEnabled;
        });
    
        
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
                zoomCheckbox.disabled = true; 
            } else {
                browser.runtime.sendMessage({ type: 'EnableSlouch' }); 
                alert('You have enabled Slouch Detection!');
                zoomCheckbox.disabled = false; 
            }
        });
    });

    zoomCheckbox.addEventListener('click', () => {
        browser.runtime.sendMessage({ type: 'IsZoomEnabled' }, enabled => {
            if (enabled) {
                browser.runtime.sendMessage({ type: 'SetZoomDisabled' });
            } else {
                browser.runtime.sendMessage({ type: 'SetZoomEnabled' });
            }
        });
    });

    // Calibrate button
    calibrateButton.addEventListener('click', () => {
        browser.runtime.sendMessage({ type: 'Recalibrate' });
    });

    setInterval(() => {
        browser.runtime.sendMessage({ type: 'IsLocked' }, locked => {
            faceCheckbox.disabled = locked;
            calibrateButton.disabled = locked;
            slouchCheckbox.disabled = locked; 
            if (locked) {
                zoomCheckbox.disabled = true; 
            } else {
                browser.runtime.sendMessage({ type: 'IsSlouchEnabled'}, enabled => {
                    zoomCheckbox.disabled = !enabled; 
                }); 
            }
        });
    }, 500);
});
