class GridMovement {
  constructor(scene, sprite, tileSize) {
    this.scene = scene;
    this.sprite = sprite;
    this.tileSize = tileSize;
    this.isMoving = false;
    this.direction = 'down';
    this.stepDuration = GAME_CONFIG.STEP_DURATION;
    this.collisionCallback = null;
  }

  setCollisionCallback(callback) {
    this.collisionCallback = callback;
  }

  getDirection() {
    return this.direction;
  }

  getDirIndex() {
    return GAME_CONFIG.DIR[this.direction.toUpperCase()];
  }

  getTilePos() {
    return {
      x: Math.round(this.sprite.x / this.tileSize),
      y: Math.round(this.sprite.y / this.tileSize),
    };
  }

  getFacingTile() {
    const pos = this.getTilePos();
    switch (this.direction) {
      case 'up': return { x: pos.x, y: pos.y - 1 };
      case 'down': return { x: pos.x, y: pos.y + 1 };
      case 'left': return { x: pos.x - 1, y: pos.y };
      case 'right': return { x: pos.x + 1, y: pos.y };
    }
  }

  tryMove(dirX, dirY) {
    if (this.isMoving) return false;

    // Determine direction name
    if (dirY < 0) this.direction = 'up';
    else if (dirY > 0) this.direction = 'down';
    else if (dirX < 0) this.direction = 'left';
    else if (dirX > 0) this.direction = 'right';

    const targetX = this.sprite.x + dirX * this.tileSize;
    const targetY = this.sprite.y + dirY * this.tileSize;

    // Check collision
    if (this.collisionCallback && this.collisionCallback(targetX, targetY)) {
      // Just face that direction, don't move
      this.sprite.anims.play(`${this.sprite.texture.key}-idle-${this.direction}`, true);
      return false;
    }

    this.isMoving = true;
    const spriteKey = this.sprite.texture.key;
    this.sprite.anims.play(`${spriteKey}-walk-${this.direction}`, true);

    this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: targetY,
      duration: this.stepDuration,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
      },
    });

    return true;
  }

  stop() {
    const spriteKey = this.sprite.texture.key;
    this.sprite.anims.play(`${spriteKey}-idle-${this.direction}`, true);
  }
}
