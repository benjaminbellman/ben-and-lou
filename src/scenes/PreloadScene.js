class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    // Set up sprite sheet frame data for all characters
    const charKeys = ['player', 'npc-lou', 'npc-ben', 'npc-bestman', 'npc-moh', 'npc-grandma'];
    const W = 16;
    const H = 24;
    const dirs = ['down', 'left', 'right', 'up'];

    charKeys.forEach(key => {
      const texture = this.textures.get(key);
      // Add frames manually: 4 cols x 4 rows
      for (let dir = 0; dir < 4; dir++) {
        for (let frame = 0; frame < 4; frame++) {
          const frameName = `${dirs[dir]}_${frame}`;
          texture.add(frameName, 0, frame * W, dir * H, W, H);
        }
      }

      // Create animations for each direction
      dirs.forEach((dir, dirIndex) => {
        // Walk animation
        this.anims.create({
          key: `${key}-walk-${dir}`,
          frames: [
            { key: key, frame: `${dir}_0` },
            { key: key, frame: `${dir}_1` },
            { key: key, frame: `${dir}_2` },
            { key: key, frame: `${dir}_3` },
          ],
          frameRate: 8,
          repeat: -1,
        });

        // Idle - just the standing frame
        this.anims.create({
          key: `${key}-idle-${dir}`,
          frames: [{ key: key, frame: `${dir}_0` }],
          frameRate: 1,
        });
      });
    });

    // Show brief loading text then proceed
    const text = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      'Loading...',
      { fontSize: '12px', color: '#f8f8f8', fontFamily: 'monospace' }
    ).setOrigin(0.5);

    this.time.delayedCall(300, () => {
      this.scene.start('TitleScene');
    });
  }
}
