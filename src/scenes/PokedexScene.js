class PokedexScene extends Phaser.Scene {
  constructor() {
    super('PokedexScene');
  }

  init(data) {
    this.pokedexManager = data.pokedexManager;
  }

  create() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    // Background
    this.add.rectangle(W/2, H/2, W, H, 0xcc3333);

    // Inner frame (Pokedex red body)
    this.add.rectangle(W/2, H/2, W - 8, H - 8, 0xaa2222).setStrokeStyle(2, 0x881111);

    // Screen area
    this.add.rectangle(W/2, H/2 - 10, W - 24, H - 60, 0x1a1a2e).setStrokeStyle(2, 0x333333);

    // Title
    this.add.text(W/2, 14, 'POKEDEX', {
      fontSize: '12px', color: '#f8d848', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Completion counter
    const discovered = this.pokedexManager.getDiscoveredCount();
    const total = this.pokedexManager.getTotalCount();
    this.add.text(W - 16, 14, `${discovered}/${total}`, {
      fontSize: '8px', color: '#ffffff', fontFamily: 'monospace',
    }).setOrigin(1, 0.5);

    // Status light
    const lightColor = discovered === total ? 0x40c040 : 0x4488ff;
    this.add.circle(16, 14, 4, lightColor);

    // Creature grid
    const creatures = this.pokedexManager.getAllCreatures();
    const cols = 4;
    const cellW = 52;
    const cellH = 56;
    const startX = (W - cols * cellW) / 2 + cellW / 2;
    const startY = 40;

    creatures.forEach((creature, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * cellW;
      const cy = startY + row * cellH;

      const isDiscovered = this.pokedexManager.isDiscovered(creature.id);

      // Cell background
      const cellBg = this.add.rectangle(cx, cy + 10, cellW - 4, cellH - 4, 0x2a2a4e, 0.8);
      cellBg.setStrokeStyle(1, isDiscovered ? 0xc8b060 : 0x444466);

      // Number
      this.add.text(cx - cellW/2 + 6, cy - 10, `#${String(i + 1).padStart(2, '0')}`, {
        fontSize: '5px', color: '#666688', fontFamily: 'monospace',
      });

      if (isDiscovered) {
        // Show creature sprite
        const sprite = this.add.image(cx, cy + 6, 'tileset', creature.spriteKey + '-small');
        sprite.setScale(1.5);

        // Name
        this.add.text(cx, cy + 24, creature.name, {
          fontSize: '5px', color: '#f8f8f8', fontFamily: 'monospace',
        }).setOrigin(0.5);

        // Type
        this.add.text(cx, cy + 31, creature.type, {
          fontSize: '4px', color: '#a0a0a0', fontFamily: 'monospace',
        }).setOrigin(0.5);
      } else {
        // Silhouette / question mark
        this.add.text(cx, cy + 8, '?', {
          fontSize: '16px', color: '#333355', fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(cx, cy + 24, '???', {
          fontSize: '5px', color: '#444466', fontFamily: 'monospace',
        }).setOrigin(0.5);
      }
    });

    // Close hint
    this.add.text(W/2, H - 12, 'Press P or ESC to close', {
      fontSize: '6px', color: '#cc8888', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Input
    this.input.keyboard.on('keydown-P', () => this.closePokedex());
    this.input.keyboard.on('keydown-ESC', () => this.closePokedex());
    this.input.keyboard.on('keydown-SPACE', () => this.closePokedex());

    // Touch to close
    this.input.on('pointerdown', () => this.closePokedex());

    this.cameras.main.fadeIn(200);
  }

  closePokedex() {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.on('camerafadeoutcomplete', () => {
      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }
}
