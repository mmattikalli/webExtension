document.addEventListener("DOMContentLoaded", () => {
    let faceSwitch = document.getElementById("faceSwitch");
    let faceCheckbox = faceSwitch.querySelector('input');

    let slouchSwitch = document.getElementById("slouchSwitch");
    let slouchCheckbox = slouchSwitch.querySelector('input');

    let zoomSwitch = document.getElementById("zoomSwitch"); 
    let zoomCheckbox = zoomSwitch.querySelector('input');

    let calibrateButton = document.getElementById('calibrate');

    // Enable the switch if face lock is enabled.
    chrome.runtime.sendMessage({ type: 'IsLockEnabled' }, enabled => {
        faceCheckbox.checked = enabled;

        chrome.runtime.sendMessage({ type: 'IsLocked' }, locked => {
            faceCheckbox.disabled = locked;
        });
    });

    chrome.runtime.sendMessage({ type: 'IsSlouchEnabled' }, slouchEnabled => {
        slouchCheckbox.checked = slouchEnabled;
        zoomCheckbox.disabled = !slouchEnabled; 

        //extendedItemThree.style.display = "inline-block";
        chrome.runtime.sendMessage({ type: 'IsZoomEnabled' }, zoomEnabled => {
            zoomCheckbox.checked = zoomEnabled;
        });
    
        
    });

   
    faceCheckbox.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'IsLockEnabled' }, enabled => {
            if (enabled) {
                chrome.runtime.sendMessage({ type: 'DisableLock' });
            } else {
                chrome.runtime.sendMessage({ type: 'EnableLock' });
            }
        });
    });

    slouchCheckbox.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'IsSlouchEnabled' }, enabled => {
            if (enabled) {
                chrome.runtime.sendMessage({ type: 'DisableSlouch' });
                zoomCheckbox.disabled = true; 
            } else {
                chrome.runtime.sendMessage({ type: 'EnableSlouch' }); 
                alert('You have enabled Slouch Detection!');
                zoomCheckbox.disabled = false; 
            }
        });
    });

    zoomCheckbox.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'IsZoomEnabled' }, enabled => {
            if (enabled) {
                chrome.runtime.sendMessage({ type: 'SetZoomDisabled' });
            } else {
                chrome.runtime.sendMessage({ type: 'SetZoomEnabled' });
            }
        });
    });

    // Calibrate button
    calibrateButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'Recalibrate' });
    });

    setInterval(() => {
        chrome.runtime.sendMessage({ type: 'IsLocked' }, locked => {
            faceCheckbox.disabled = locked;
            calibrateButton.disabled = locked;
            slouchCheckbox.disabled = locked; 
            if (locked) {
                zoomCheckbox.disabled = true; 
            } else {
                chrome.runtime.sendMessage({ type: 'IsSlouchEnabled'}, enabled => {
                    zoomCheckbox.disabled = !enabled; 
                }); 
            }
        });
    }, 500);
});
