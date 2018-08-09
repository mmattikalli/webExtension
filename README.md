# Web Extension

## Development

To load the extension first enable extension developer features in [about:flags](about:flags), then load the extension from the extensions menu.

Each time the browser restarts, the extension will have to be granted access. 

To enable faceID security, toggle the bar on the homepage. Holding still for approximately 5-10 seconds on the calibration screen should initialize browsing with our feature. The webpage will be blurred until calibrated, and will not unblur unless the user's face (that was calibrated) is recognized in the webcam. 

During browsing, the webcam should stay on, to monitor if a user has left the viscinity or not. A picture from the webstream is taken every 7 seconds, and therefore, if one leaves the area, the browsing window may take a couple seconds to lock.

To disable the extension, turn the toggle switch off. 
