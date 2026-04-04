class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    this.setupCharacterAnimations();
    this.scene.start('TitleScene');
  }

  setupCharacterAnimations() {
    const charKeys = ['player', 'npc-lou', 'npc-ben', 'npc-bestman', 'npc-moh', 'npc-grandma'];
    const W = 16;
    const H = 24;
    const dirs = ['down', 'left', 'right', 'up'];

    for (let k = 0; k < charKeys.length; k++) {
      const key = charKeys[k];
      const texture = this.textures.get(key);
      if (!texture || texture.key === '__MISSING') continue;

      for (let dir = 0; dir < 4; dir++) {
        for (let frame = 0; frame < 4; frame++) {
          const frameName = dirs[dir] + '_' + frame;
          try {
            texture.add(frameName, 0, frame * W, dir * H, W, H);
          } catch (e) {
            // skip
          }
        }
      }

      for (let d = 0; d < dirs.length; d++) {
        var dir = dirs[d];
        if (!this.anims.exists(key + '-walk-' + dir)) {
          this.anims.create({
            key: key + '-walk-' + dir,
            frames: [
              { key: key, frame: dir + '_0' },
              { key: key, frame: dir + '_1' },
              { key: key, frame: dir + '_2' },
              { key: key, frame: dir + '_3' },
            ],
            frameRate: 8,
            repeat: -1,
          });
        }

        if (!this.anims.exists(key + '-idle-' + dir)) {
          this.anims.create({
            key: key + '-idle-' + dir,
            frames: [{ key: key, frame: dir + '_0' }],
            frameRate: 1,
          });
        }
      }
    }
  }
}
