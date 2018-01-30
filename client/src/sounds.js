var moveSound = new Audio(require('./audio/Move.mp3'));
var captureSound = new Audio(require('./audio/Capture.mp3'));

export function playMoveSound() {
  moveSound.play();
  moveSound.currentTime = 0;
}

export function playCaptureSound() {
  captureSound.play();
  captureSound.currentTime = 0;
}
