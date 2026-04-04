class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e);

    // Hearts background
    for (let i = 0; i < 15; i++) {
      const heart = this.add.text(
        Phaser.Math.Between(10, W - 10),
        Phaser.Math.Between(10, H + 200),
        '\u2665',
        {
          fontSize: `${Phaser.Math.Between(8, 16)}px`,
          color: '#ff668844',
          fontFamily: 'monospace',
        }
      ).setAlpha(0.2);

      this.tweens.add({
        targets: heart,
        y: -20,
        duration: Phaser.Math.Between(4000, 8000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
      });
    }

    // Scrolling credits text
    const creditLines = [
      { text: '\u2665 \u2665 \u2665', size: '14px', color: '#ff6688', delay: 0 },
      { text: '', size: '8px', color: '#ffffff', delay: 200 },
      { text: "Ben & Lou's", size: '16px', color: '#f8d848', delay: 500 },
      { text: 'Wedding Adventure', size: '14px', color: '#f8d848', delay: 800 },
      { text: '', size: '8px', color: '#ffffff', delay: 1000 },
      { text: 'Thank you for playing!', size: '10px', color: '#ffffff', delay: 1500 },
      { text: '', size: '8px', color: '#ffffff', delay: 1700 },
      { text: 'And thank you for being', size: '9px', color: '#ffffff', delay: 2200 },
      { text: 'part of our special day!', size: '9px', color: '#ffffff', delay: 2500 },
      { text: '', size: '8px', color: '#ffffff', delay: 2800 },
      { text: '\u2665 With love \u2665', size: '12px', color: '#ff6688', delay: 3500 },
      { text: 'Ben & Lou', size: '14px', color: '#f8d848', delay: 4000 },
      { text: '', size: '8px', color: '#ffffff', delay: 4300 },
      { text: '', size: '8px', color: '#ffffff', delay: 4500 },
      { text: "Don't forget to sign", size: '8px', color: '#a0a0a0', delay: 5500 },
      { text: 'the guestbook!', size: '8px', color: '#a0a0a0', delay: 5800 },
    ];

    let y = H + 20;
    creditLines.forEach((line, i) => {
      const text = this.add.text(W / 2, y, line.text, {
        fontSize: line.size,
        color: line.color,
        fontFamily: 'monospace',
        fontStyle: line.size === '16px' || line.size === '14px' ? 'bold' : 'normal',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: text,
        alpha: 1,
        y: y - H - 20,
        duration: 8000,
        delay: line.delay + 500,
        ease: 'Linear',
      });

      y += parseInt(line.size) + 8;
    });

    // Options after credits
    this.time.delayedCall(8000, () => {
      const btnY = H - 30;

      const guestbookBtn = this.add.text(W / 2, btnY, '[ Sign Guestbook ]', {
        fontSize: '9px', color: '#f8d848', fontFamily: 'monospace',
      }).setOrigin(0.5).setInteractive().setAlpha(0);

      const replayBtn = this.add.text(W / 2, btnY + 16, '[ Play Again ]', {
        fontSize: '8px', color: '#a0a0a0', fontFamily: 'monospace',
      }).setOrigin(0.5).setInteractive().setAlpha(0);

      this.tweens.add({ targets: guestbookBtn, alpha: 1, duration: 500 });
      this.tweens.add({ targets: replayBtn, alpha: 1, duration: 500, delay: 200 });

      guestbookBtn.on('pointerdown', () => {
        this.scene.start('GuestbookScene');
      });

      replayBtn.on('pointerdown', () => {
        SaveManager.deleteSave();
        this.scene.start('TitleScene');
      });

      // Keyboard support
      this.input.keyboard.on('keydown-SPACE', () => {
        this.scene.start('GuestbookScene');
      });
    });

    this.cameras.main.fadeIn(1000);
  }
}
