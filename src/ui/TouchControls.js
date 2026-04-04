class TouchControls {
  constructor(scene, inputManager) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.isTouch = false;

    // Check for touch support
    if (scene.sys.game.device.input.touch) {
      this.isTouch = true;
      this.createControls();
    }
  }

  createControls() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(200);
    this.container.setScrollFactor(0);

    // D-pad
    const dpadX = 32;
    const dpadY = H - 40;
    const btnSize = 18;
    const gap = 1;

    const dirs = [
      { dir: 'up', x: 0, y: -btnSize - gap },
      { dir: 'down', x: 0, y: btnSize + gap },
      { dir: 'left', x: -btnSize - gap, y: 0 },
      { dir: 'right', x: btnSize + gap, y: 0 },
    ];

    // D-pad center background
    const dpadBg = this.scene.add.circle(dpadX, dpadY, 30, 0x000000, 0.2);
    this.container.add(dpadBg);

    dirs.forEach(d => {
      const btn = this.scene.add.rectangle(
        dpadX + d.x, dpadY + d.y, btnSize, btnSize,
        0xffffff, 0.25
      );
      btn.setStrokeStyle(1, 0xffffff, 0.4);
      btn.setInteractive();

      // Arrow symbols
      const arrows = { up: '\u25b2', down: '\u25bc', left: '\u25c0', right: '\u25b6' };
      const arrow = this.scene.add.text(dpadX + d.x, dpadY + d.y, arrows[d.dir], {
        fontSize: '8px',
        color: '#ffffff',
        fontFamily: 'monospace',
      }).setOrigin(0.5).setAlpha(0.5);

      btn.on('pointerdown', () => {
        this.inputManager.setTouchDirection(d.dir);
        btn.setFillStyle(0xffffff, 0.5);
      });
      btn.on('pointerup', () => {
        this.inputManager.setTouchDirection(null);
        btn.setFillStyle(0xffffff, 0.25);
      });
      btn.on('pointerout', () => {
        this.inputManager.setTouchDirection(null);
        btn.setFillStyle(0xffffff, 0.25);
      });

      this.container.add(btn);
      this.container.add(arrow);
    });

    // Action button (A)
    const actionX = W - 32;
    const actionY = H - 40;
    const actionBtn = this.scene.add.circle(actionX, actionY, 16, 0xf8d848, 0.35);
    actionBtn.setStrokeStyle(2, 0xf8d848, 0.5);
    actionBtn.setInteractive();

    const actionLabel = this.scene.add.text(actionX, actionY, 'A', {
      fontSize: '10px',
      color: '#f8d848',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.7);

    actionBtn.on('pointerdown', () => {
      this.inputManager.triggerTouchAction();
      actionBtn.setFillStyle(0xf8d848, 0.6);
    });
    actionBtn.on('pointerup', () => {
      actionBtn.setFillStyle(0xf8d848, 0.35);
    });

    this.container.add(actionBtn);
    this.container.add(actionLabel);
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
    }
  }
}
