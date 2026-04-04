class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      W: scene.input.keyboard.addKey('W'),
      A: scene.input.keyboard.addKey('A'),
      S: scene.input.keyboard.addKey('S'),
      D: scene.input.keyboard.addKey('D'),
    };
    this.actionKeys = {
      space: scene.input.keyboard.addKey('SPACE'),
      enter: scene.input.keyboard.addKey('ENTER'),
      z: scene.input.keyboard.addKey('Z'),
    };
    this.cancelKey = scene.input.keyboard.addKey('X');

    // Touch state
    this.touchDirection = { up: false, down: false, left: false, right: false };
    this.touchAction = false;
    this.touchActionJustPressed = false;

    // Action debounce
    this._actionConsumed = false;
  }

  getMovement() {
    return {
      up: this.cursors.up.isDown || this.wasd.W.isDown || this.touchDirection.up,
      down: this.cursors.down.isDown || this.wasd.S.isDown || this.touchDirection.down,
      left: this.cursors.left.isDown || this.wasd.A.isDown || this.touchDirection.left,
      right: this.cursors.right.isDown || this.wasd.D.isDown || this.touchDirection.right,
    };
  }

  isActionJustPressed() {
    const keyboard = Phaser.Input.Keyboard.JustDown(this.actionKeys.space) ||
                     Phaser.Input.Keyboard.JustDown(this.actionKeys.enter) ||
                     Phaser.Input.Keyboard.JustDown(this.actionKeys.z);
    const touch = this.touchActionJustPressed;

    if (keyboard || touch) {
      this.touchActionJustPressed = false;
      if (!this._actionConsumed) {
        this._actionConsumed = true;
        return true;
      }
    }
    return false;
  }

  isCancelJustPressed() {
    return Phaser.Input.Keyboard.JustDown(this.cancelKey);
  }

  resetAction() {
    this._actionConsumed = false;
  }

  update() {
    this._actionConsumed = false;
  }

  // Called by TouchControls
  setTouchDirection(dir) {
    this.touchDirection = { up: false, down: false, left: false, right: false };
    if (dir) this.touchDirection[dir] = true;
  }

  triggerTouchAction() {
    this.touchActionJustPressed = true;
  }
}
