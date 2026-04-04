class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    // Background
    this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'title-bg');

    // Title text
    const titleStyle = {
      fontSize: '16px',
      color: '#f8d848',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#443322',
      strokeThickness: 3,
    };

    this.add.text(GAME_CONFIG.WIDTH / 2, 55, "Ben & Lou's", {
      ...titleStyle,
      fontSize: '14px',
    }).setOrigin(0.5);

    this.add.text(GAME_CONFIG.WIDTH / 2, 75, 'Wedding Adventure', {
      ...titleStyle,
      fontSize: '13px',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_CONFIG.WIDTH / 2, 100, 'A Pixel Love Story', {
      fontSize: '8px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#443322',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Menu options
    this.menuItems = [];
    this.selectedIndex = 0;

    const hasSave = SaveManager.hasSave();

    if (hasSave) {
      this.menuItems.push({ text: 'Continue', action: () => this.continueGame() });
    }
    this.menuItems.push({ text: 'New Game', action: () => this.newGame() });

    const menuY = 140;
    this.menuTexts = this.menuItems.map((item, i) => {
      return this.add.text(GAME_CONFIG.WIDTH / 2, menuY + i * 18, item.text, {
        fontSize: '10px',
        color: '#f8f8f8',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
    });

    // Selection cursor
    this.cursor = this.add.text(0, 0, '\u25b6', {
      fontSize: '10px',
      color: '#f8d848',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.updateCursor();

    // Blinking "Press Start" for mobile
    this.pressText = this.add.text(GAME_CONFIG.WIDTH / 2, 195, 'Press SPACE or tap to start', {
      fontSize: '7px',
      color: '#a0a0a0',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.pressText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Version text
    this.add.text(GAME_CONFIG.WIDTH - 4, GAME_CONFIG.HEIGHT - 4, 'v1.0', {
      fontSize: '6px',
      color: '#666666',
      fontFamily: 'monospace',
    }).setOrigin(1, 1);

    // Input
    this.input.keyboard.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-W', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-S', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-SPACE', () => this.selectItem());
    this.input.keyboard.on('keydown-ENTER', () => this.selectItem());
    this.input.keyboard.on('keydown-Z', () => this.selectItem());

    // Touch - tap on menu items
    this.menuTexts.forEach((text, i) => {
      text.setInteractive();
      text.on('pointerdown', () => {
        this.selectedIndex = i;
        this.updateCursor();
        this.selectItem();
      });
    });

    // Also allow general tap
    this.input.on('pointerdown', (pointer) => {
      // Only if not on a menu item
      if (!this.menuTexts.some(t => t.getBounds().contains(pointer.x, pointer.y))) {
        this.selectItem();
      }
    });
  }

  moveSelection(delta) {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + delta, 0, this.menuItems.length);
    this.updateCursor();
  }

  updateCursor() {
    const target = this.menuTexts[this.selectedIndex];
    this.cursor.setPosition(target.x - target.width / 2 - 10, target.y);

    this.menuTexts.forEach((t, i) => {
      t.setColor(i === this.selectedIndex ? '#f8d848' : '#f8f8f8');
    });
  }

  selectItem() {
    this.menuItems[this.selectedIndex].action();
  }

  continueGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.on('camerafadeoutcomplete', () => {
      this.scene.start('OverworldScene', { loadSave: true });
    });
  }

  newGame() {
    SaveManager.deleteSave();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.on('camerafadeoutcomplete', () => {
      this.scene.start('OverworldScene', { loadSave: false });
    });
  }
}
