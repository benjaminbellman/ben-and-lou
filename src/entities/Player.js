class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, tileX, tileY) {
    const T = GAME_CONFIG.TILE_SIZE;
    super(scene, tileX * T, tileY * T, 'player', 'down_0');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.75);
    this.setDepth(5);
    this.body.setSize(12, 12);
    this.body.setOffset(2, 12);
    this.body.immovable = false;

    this.gridMovement = new GridMovement(scene, this, T);
  }

  setCollisionCallback(callback) {
    this.gridMovement.setCollisionCallback(callback);
  }

  update(inputManager) {
    if (this.gridMovement.isMoving) return;

    const move = inputManager.getMovement();

    if (move.up) {
      this.gridMovement.tryMove(0, -1);
    } else if (move.down) {
      this.gridMovement.tryMove(0, 1);
    } else if (move.left) {
      this.gridMovement.tryMove(-1, 0);
    } else if (move.right) {
      this.gridMovement.tryMove(1, 0);
    }

    if (!move.up && !move.down && !move.left && !move.right) {
      this.gridMovement.stop();
    }
  }

  getDirection() {
    return this.gridMovement.getDirection();
  }

  getTilePos() {
    return this.gridMovement.getTilePos();
  }

  getFacingTile() {
    return this.gridMovement.getFacingTile();
  }

  isMoving() {
    return this.gridMovement.isMoving;
  }
}
