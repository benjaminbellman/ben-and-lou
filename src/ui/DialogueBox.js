class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this.isVisible = false;

    const W = GAME_CONFIG.WIDTH;
    const H = 56;
    const Y = GAME_CONFIG.HEIGHT - H;

    this.container = scene.add.container(0, Y);
    this.container.setDepth(100);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    // Background
    this.bg = scene.add.image(W / 2, H / 2, 'dialogue-box');
    this.container.add(this.bg);

    // Speaker name
    this.nameText = scene.add.text(12, 6, '', {
      fontSize: '8px',
      color: '#f8d848',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.container.add(this.nameText);

    // Body text
    this.bodyText = scene.add.text(12, 18, '', {
      fontSize: '8px',
      color: '#f8f8f8',
      fontFamily: 'monospace',
      wordWrap: { width: W - 28 },
      lineSpacing: 2,
    });
    this.container.add(this.bodyText);

    // Advance indicator (triangle)
    this.advanceIndicator = scene.add.text(W - 16, H - 12, '\u25bc', {
      fontSize: '6px',
      color: '#f8d848',
      fontFamily: 'monospace',
    });
    this.advanceIndicator.setVisible(false);
    this.container.add(this.advanceIndicator);

    // Bounce the indicator
    scene.tweens.add({
      targets: this.advanceIndicator,
      y: H - 10,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });

    // Typewriter
    this.typewriter = new TypewriterEffect(scene, this.bodyText);
  }

  show(speaker, text, onComplete) {
    this.isVisible = true;
    this.container.setVisible(true);
    this.nameText.setText(speaker || '');
    this.advanceIndicator.setVisible(false);

    this.typewriter.start(text, () => {
      this.advanceIndicator.setVisible(true);
      if (onComplete) onComplete();
    });
  }

  isTyping() {
    return !this.typewriter.isComplete;
  }

  skipTypewriter() {
    return this.typewriter.skip();
  }

  hide() {
    this.isVisible = false;
    this.container.setVisible(false);
    this.typewriter.destroy();
  }

  destroy() {
    this.typewriter.destroy();
    this.container.destroy();
  }
}
