/**
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 *
 * @returns {Uint8Array}
 */
function captureFrame(video, canvas) {
    canvas.width = video.width;
    canvas.height = video.height;

    canvas.getContext('2d').lineTo(50, 50);
    canvas.getContext('2d').drawImage(video, 0, 0);

    // convert the canvas to a base64-encoded png file
    let data = canvas.toDataURL('image/png').split(',')[1];

    let bytes = atob(data);
    let buffer = new ArrayBuffer(bytes.length);
    let byteArr = new Uint8Array(buffer);

    for (let i = 0; i < bytes.length; i++) {
        byteArr[i] = bytes.charCodeAt(i);
    }

    return byteArr;
}

document.addEventListener('DOMContentLoaded', () => {
    let videoElement = document.querySelector('#facelockVideo');
    let canvasElement = document.querySelector('#facelockCanvas');

    navigator.mediaDevices.getUserMedia({
        video: true
    }).then(stream => {
        video.width = stream.width;
        video.height = stream.height;

        setInterval((video, canvas) => {
            let frame = captureFrame(video, canvas);
            console.log(frame.length);
        }, 8000, videoElement, canvasElement);
    });
});
