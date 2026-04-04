class ChoiceMenu {
  constructor(scene) {
    this.scene = scene;
    this.isVisible = false;
    this.selectedIndex = 0;
    this.choices = [];
    this.onSelect = null;

    const W = GAME_CONFIG.WIDTH;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(101);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    this.choiceTexts = [];
    this.cursor = null;
  }

  show(choices, onSelect) {
    this.choices = choices;
    this.onSelect = onSelect;
    this.selectedIndex = 0;
    this.isVisible = true;

    // Clear old
    this.container.removeAll(true);
    this.choiceTexts = [];

    const W = GAME_CONFIG.WIDTH;
    const itemH = 14;
    const padding = 8;
    const boxH = choices.length * itemH + padding * 2;
    const boxW = 120;
    const boxX = W - boxW - 8;
    const boxY = GAME_CONFIG.HEIGHT - 56 - boxH - 4;

    // Background
    const bg = this.scene.add.rectangle(
      boxX + boxW / 2, boxY + boxH / 2, boxW, boxH,
      GAME_CONFIG.COLORS.DIALOGUE_BG, 0.95
    );
    bg.setStrokeStyle(2, GAME_CONFIG.COLORS.DIALOGUE_BORDER);
    this.container.add(bg);

    // Choice texts
    choices.forEach((choice, i) => {
      const text = this.scene.add.text(
        boxX + 16, boxY + padding + i * itemH,
        choice.text,
        {
          fontSize: '8px',
          color: '#f8f8f8',
          fontFamily: 'monospace',
        }
      );
      text.setInteractive();
      text.on('pointerdown', () => {
        this.selectedIndex = i;
        this.select();
      });
      text.on('pointerover', () => {
        this.selectedIndex = i;
        this.updateCursor();
      });
      this.choiceTexts.push(text);
      this.container.add(text);
    });

    // Cursor
    this.cursor = this.scene.add.text(
      boxX + 6, boxY + padding,
      '\u25b6',
      { fontSize: '8px', color: '#f8d848', fontFamily: 'monospace' }
    );
    this.container.add(this.cursor);

    this.container.setVisible(true);
    this.updateCursor();
  }

  moveSelection(delta) {
    if (!this.isVisible) return;
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + delta, 0, this.choices.length);
    this.updateCursor();
  }

  updateCursor() {
    if (!this.cursor || this.choiceTexts.length === 0) return;
    this.cursor.y = this.choiceTexts[this.selectedIndex].y;
    this.choiceTexts.forEach((t, i) => {
      t.setColor(i === this.selectedIndex ? '#f8d848' : '#f8f8f8');
    });
  }

  select() {
    if (!this.isVisible) return;
    const choice = this.choices[this.selectedIndex];
    this.hide();
    if (this.onSelect) this.onSelect(choice, this.selectedIndex);
  }

  hide() {
    this.isVisible = false;
    this.container.setVisible(false);
  }

  destroy() {
    this.container.destroy();
  }
}
