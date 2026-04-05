class TrainerCardScene extends Phaser.Scene {
  constructor() {
    super('TrainerCardScene');
  }

  init(data) {
    this.badgeManager = data.badgeManager;
    this.pokedexManager = data.pokedexManager;
    this.questManager = data.questManager;
  }

  create() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    // Card background
    this.add.rectangle(W/2, H/2, W, H, 0x2244aa);
    this.add.rectangle(W/2, H/2, W - 8, H - 8, 0x2a4488).setStrokeStyle(2, 0x4466aa);

    // Title bar
    this.add.rectangle(W/2, 14, W - 16, 18, 0x1a3366);
    this.add.text(W/2, 14, 'TRAINER CARD', {
      fontSize: '10px', color: '#f8d848', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Player sprite
    const playerSprite = this.add.image(36, 56, 'player', 'down_0');
    playerSprite.setScale(2);

    // Player info
    this.add.text(68, 36, 'Guest', {
      fontSize: '9px', color: '#f8f8f8', fontFamily: 'monospace', fontStyle: 'bold',
    });
    this.add.text(68, 50, "Ben & Lou's Wedding", {
      fontSize: '6px', color: '#aabbdd', fontFamily: 'monospace',
    });

    // Companion creature
    this.add.image(68, 70, 'creature-atlas', 'creature-ringbear-small');
    this.add.text(82, 67, 'Partner: Ringbear', {
      fontSize: '6px', color: '#c0c0c0', fontFamily: 'monospace',
    });

    // Divider
    this.add.rectangle(W/2, 86, W - 24, 1, 0x4466aa);

    // Stats
    const statsX = 16;
    let statsY = 94;

    // Pokedex completion
    const discovered = this.pokedexManager.getDiscoveredCount();
    const total = this.pokedexManager.getTotalCount();
    this.add.text(statsX, statsY, `Pokedex: ${discovered}/${total} discovered`, {
      fontSize: '7px', color: '#f8f8f8', fontFamily: 'monospace',
    });

    // Completion bar
    const barX = statsX;
    const barY = statsY + 12;
    const barW = W - 32;
    const barH = 6;
    this.add.rectangle(barX + barW/2, barY + barH/2, barW, barH, 0x1a3366);
    const fillW = total > 0 ? (discovered / total) * barW : 0;
    if (fillW > 0) {
      this.add.rectangle(barX + fillW/2, barY + barH/2, fillW, barH, 0x40c040);
    }

    // Quests completed
    statsY += 26;
    const questsComplete = Object.keys(this.questManager.quests).filter(id =>
      this.questManager.isQuestComplete(id)
    ).length;
    const questsTotal = Object.keys(this.questManager.quests).length;
    this.add.text(statsX, statsY, `Quests: ${questsComplete}/${questsTotal} completed`, {
      fontSize: '7px', color: '#f8f8f8', fontFamily: 'monospace',
    });

    // Divider
    statsY += 16;
    this.add.rectangle(W/2, statsY, W - 24, 1, 0x4466aa);

    // Badges section
    statsY += 8;
    this.add.text(W/2, statsY, 'BADGES', {
      fontSize: '9px', color: '#f8d848', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    statsY += 16;
    const badges = this.badgeManager.getAllBadges();
    const badgeSpacing = (W - 32) / badges.length;
    const badgeStartX = 16 + badgeSpacing / 2;

    badges.forEach((badge, i) => {
      const bx = badgeStartX + i * badgeSpacing;
      const earned = this.badgeManager.hasBadge(badge.id);
      const spriteKey = earned ? badge.spriteKey : 'badge-locked';

      const img = this.add.image(bx, statsY + 12, 'tileset', spriteKey);
      img.setScale(1.2);

      // Badge name
      this.add.text(bx, statsY + 30, earned ? badge.name.replace(' Badge', '') : '???', {
        fontSize: '5px', color: earned ? '#f8d848' : '#555588', fontFamily: 'monospace',
      }).setOrigin(0.5);

      // Shine animation on earned badges
      if (earned) {
        this.tweens.add({
          targets: img,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    });

    // Close hint
    this.add.text(W/2, H - 12, 'Press T or ESC to close', {
      fontSize: '6px', color: '#6688bb', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Input
    this.input.keyboard.on('keydown-T', () => this.closeCard());
    this.input.keyboard.on('keydown-ESC', () => this.closeCard());
    this.input.keyboard.on('keydown-SPACE', () => this.closeCard());
    this.input.on('pointerdown', () => this.closeCard());

    this.cameras.main.fadeIn(200);
  }

  closeCard() {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.on('camerafadeoutcomplete', () => {
      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }
}
