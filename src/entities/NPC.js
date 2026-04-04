class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config) {
    const T = GAME_CONFIG.TILE_SIZE;
    const spriteKey = config.spriteKey || 'npc-ben';
    super(scene, config.tileX * T, config.tileY * T, spriteKey, `${config.direction || 'down'}_0`);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.75);
    this.setDepth(5);
    this.body.setSize(14, 14);
    this.body.setOffset(1, 10);
    this.body.immovable = true;

    this.npcId = config.id;
    this.npcName = config.name;
    this.dialogueId = config.dialogueId;
    this.questId = config.questId || null;
    this.direction = config.direction || 'down';

    // Play idle animation
    this.anims.play(`${spriteKey}-idle-${this.direction}`, true);

    // Quest indicator (floating above head)
    this.questIndicator = null;
  }

  facePlayer(playerDirection) {
    // Face opposite of player's direction
    const opposite = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };
    this.direction = opposite[playerDirection] || 'down';
    this.anims.play(`${this.texture.key}-idle-${this.direction}`, true);
  }

  showQuestIndicator(type) {
    if (this.questIndicator) {
      this.questIndicator.destroy();
    }

    let textureKey;
    if (type === 'available') textureKey = 'quest-exclaim';
    else if (type === 'ready') textureKey = 'quest-question';
    else if (type === 'complete') textureKey = 'quest-check';
    else return;

    this.questIndicator = this.scene.add.image(this.x, this.y - 20, textureKey);
    this.questIndicator.setDepth(10);

    // Bounce animation
    this.scene.tweens.add({
      targets: this.questIndicator,
      y: this.y - 24,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  hideQuestIndicator() {
    if (this.questIndicator) {
      this.questIndicator.destroy();
      this.questIndicator = null;
    }
  }

  updateIndicatorPosition() {
    if (this.questIndicator) {
      this.questIndicator.x = this.x;
    }
  }

  getTilePos() {
    return {
      x: Math.round(this.x / GAME_CONFIG.TILE_SIZE),
      y: Math.round(this.y / GAME_CONFIG.TILE_SIZE),
    };
  }
}
