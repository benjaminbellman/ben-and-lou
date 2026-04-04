class QuestLog {
  constructor(scene, questManager) {
    this.scene = scene;
    this.questManager = questManager;
    this.isVisible = false;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(150);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    this.isVisible = true;
    this.container.removeAll(true);

    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;
    const padding = 12;

    // Background
    const bg = this.scene.add.rectangle(W / 2, H / 2, W - 24, H - 40, 0x1a1a3e, 0.95);
    bg.setStrokeStyle(2, 0xc8b060);
    this.container.add(bg);

    // Title
    this.container.add(this.scene.add.text(W / 2, 30, 'Quest Log', {
      fontSize: '12px', color: '#f8d848', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5));

    // Quests
    let y = 50;
    const quests = Object.values(this.questManager.quests);

    if (quests.length === 0) {
      this.container.add(this.scene.add.text(W / 2, H / 2, 'No quests yet!\nTalk to people to find quests.', {
        fontSize: '8px', color: '#a0a0a0', fontFamily: 'monospace', align: 'center',
      }).setOrigin(0.5));
    } else {
      quests.forEach(quest => {
        const state = this.questManager.questState[quest.id];
        let statusIcon, statusColor;

        if (!state) {
          statusIcon = '\u2610'; // empty box
          statusColor = '#666666';
        } else if (state.status === 'complete') {
          statusIcon = '\u2611'; // checked box
          statusColor = '#40c040';
        } else {
          statusIcon = '\u25cb'; // circle
          statusColor = '#f8d848';
        }

        this.container.add(this.scene.add.text(24, y, `${statusIcon} ${quest.title}`, {
          fontSize: '8px', color: statusColor, fontFamily: 'monospace',
        }));

        y += 12;

        // Show current step if active
        if (state && state.status === 'active') {
          const step = this.questManager.getCurrentStep(quest.id);
          if (step) {
            this.container.add(this.scene.add.text(34, y, step.description, {
              fontSize: '7px', color: '#a0a0a0', fontFamily: 'monospace',
            }));
            y += 10;
          }
        }

        y += 4;
      });
    }

    // Close hint
    this.container.add(this.scene.add.text(W / 2, H - 28, 'Press Q or tap to close', {
      fontSize: '7px', color: '#666666', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Make background interactive to close
    bg.setInteractive();
    bg.on('pointerdown', () => this.hide());

    this.container.setVisible(true);
  }

  hide() {
    this.isVisible = false;
    this.container.setVisible(false);
  }

  destroy() {
    this.container.destroy();
  }
}
