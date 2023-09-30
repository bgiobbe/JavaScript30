const filter = document.querySelector('#filter');
const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(localMediaStream => {
            video.srcObject = localMediaStream;
            video.play();
        })
        .catch(err => {
            alert(`This page doesn't work unless you allow webcam access!\n\n${err}`);
        });
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        // get the image's data, mess with it, and put it back
        let pixels = ctx.getImageData(0, 0, width, height);
        switch (filter.value) {
            case 'red-shift':
                pixels = redEffect(pixels); break;
            case 'rgb-split':
                pixels = rgbSplit(pixels); break;
            case 'green-screen':
                pixels = greenScreen(pixels); break;
        }
        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

function takePhoto() {
    // play sound
    snap.currentTime = 0;
    snap.play();

    // create linked image from canvas and put it at beginning of strip
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    //link.setAttribute('download', 'snapshot');
    link.setAttribute('target', '_blank');
    link.innerHTML = `<img src="${data}" alt="photo from webcam">`;
    strip.insertBefore(link, strip.firstChild);
    link.addEventListener('click', deletePhoto);
}

function deletePhoto(e) {
    e.altKey && e.preventDefault();
    e.altKey && this.remove();
}

function redEffect(pixels) {
    // pixel data is [red, green, blue, alpha] per pixel
    for (let i=0; i < pixels.data.length; i+=4) {
        pixels.data[i] += 100;         // red
        pixels.data[i + 1] -= 50;  // green
        pixels.data[i + 2] *= 0.5;  // blue
    }
    return pixels;
}

function rgbSplit(pixels) {
    // pixel data is [red, green, blue, alpha] per pixel
    for (let i=0; i < pixels.data.length; i+=4) {
        pixels.data[i - 150] = pixels.data[i];      // red
        pixels.data[i + 100] = pixels.data[i + 1];  // green
        pixels.data[i - 150] = pixels.data[i + 2];  // blue
    }
    return pixels;
}

function greenScreen(pixels) {
    const levels = {};

    document.querySelectorAll('.rgb input').forEach(input => {
        levels[input.name] = input.value;
    });
    // If min < max for a color, swap them
    if (levels.rmin > levels.rmax) {
        levels.rmax = [levels.rmin, levels.rmin = levels.rmax][0];
    }
    if (levels.gmin > levels.gmax) {
        levels.gmax = [levels.gmin, levels.gmin = levels.gmax][0];
    }
    if (levels.bmin > levels.bmax) {
        levels.bmax = [levels.bmin, levels.bmin = levels.bmax][0];
    }

    for (var i=0; i < pixels.data.length; i+=4) {
        const red = pixels.data[i];
        const green = pixels.data[i + 1];
        const blue = pixels.data[i + 2];
        // pixels.data[i + 3] is alpha

        if (levels.rmin <= red && red <= levels.rmax &&
            levels.gmin <= green && green <= levels.gmax &&
            levels.bmin <= blue && blue <= levels.bmax) {
                pixels.data[i + 3] = 0; // make it fully transparent
        }
    }
    return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);
