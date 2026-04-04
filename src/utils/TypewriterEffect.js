class TypewriterEffect {
  constructor(scene, textObject, speed) {
    this.scene = scene;
    this.textObject = textObject;
    this.speed = speed || GAME_CONFIG.TYPEWRITER_SPEED;
    this.fullText = '';
    this.currentIndex = 0;
    this.timer = null;
    this.isComplete = false;
    this.onComplete = null;
  }

  start(text, onComplete) {
    this.fullText = text;
    this.currentIndex = 0;
    this.isComplete = false;
    this.onComplete = onComplete;
    this.textObject.setText('');

    if (this.timer) this.timer.remove();

    this.timer = this.scene.time.addEvent({
      delay: this.speed,
      callback: this.addChar,
      callbackScope: this,
      repeat: text.length - 1,
    });
  }

  addChar() {
    this.currentIndex++;
    this.textObject.setText(this.fullText.substring(0, this.currentIndex));

    if (this.currentIndex >= this.fullText.length) {
      this.complete();
    }
  }

  skip() {
    if (this.isComplete) return false;

    if (this.timer) this.timer.remove();
    this.currentIndex = this.fullText.length;
    this.textObject.setText(this.fullText);
    this.complete();
    return true;
  }

  complete() {
    this.isComplete = true;
    if (this.onComplete) this.onComplete();
  }

  destroy() {
    if (this.timer) this.timer.remove();
  }
}
