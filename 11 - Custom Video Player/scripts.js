/* Get elements */
const player = document.querySelector('.player');
const controlPanel = player.querySelector('.player__controls');
const video = player.querySelector('.viewer');
const toggle = player.querySelector('.toggle');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');
const skipButtons = player.querySelectorAll('[data-skip]');
const ranges = player.querySelectorAll('.player__slider');
 
/* Build out functions */

function togglePlay() {
    //console.log(`togglePlay()  paused=${video.paused}`);
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

function updateButton() {
    toggle.innerText = (video.paused) ? '►' : '❚ ❚';
}

function skip() {
    console.log('skipping', this.dataset.skip);
    video.currentTime += parseFloat(this.dataset.skip);
}

function handleRangeUpdate(e) {
    const slider = (this.name === '') ? e.target : this;
    //console.log('handleRangeUpdate()', slider.name, slider.value);
    video[slider.name] = slider.value;
}

function updateProgress() {
    //console.log('updateProgress()', video.currentTime);
    const percentage = 100 * video.currentTime / video.duration;
    progressBar.style.flexBasis = `${percentage}%`;
}

/* Go to particular place in video */
function scrub(e) {
    const scrubTime = video.duration * e.offsetX / progress.offsetWidth;
    //console.log('scrub()', scrubTime);
    video.currentTime = scrubTime;
}

/* Hook up the event listeners */

// keep track of mouse button state for progress bar and sliders
let mouseDown = false;
document.addEventListener('mouseup', () => mouseDown = false);
progress.addEventListener('mousedown', () => mouseDown = true);
ranges.forEach(range => range.addEventListener('mousedown', () => mouseDown = true));

progress.addEventListener('click', scrub);
progress.addEventListener('mousemove', (e) => mouseDown && scrub(e));

ranges.forEach(range => range.addEventListener('change', handleRangeUpdate));
ranges.forEach(range => range.addEventListener('mousemove', (e) => mouseDown && handleRangeUpdate(e)));

skipButtons.forEach(button => button.addEventListener('click', skip));
toggle.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);
video.addEventListener('play', updateButton);
video.addEventListener('pause', updateButton);
video.addEventListener('timeupdate', updateProgress);


