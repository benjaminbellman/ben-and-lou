class BattleHUD {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(10);
    this.answerButtons = [];
    this.selectedIndex = 0;
    this.onAnswer = null;
    this.isWaiting = false;
  }

  showQuestion(questionData) {
    this.container.removeAll(true);
    this.answerButtons = [];
    this.selectedIndex = 0;
    this.isWaiting = false;

    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    // Header
    this.container.add(this.scene.add.text(W / 2, 12, questionData.title || 'Trivia Challenge', {
      fontSize: '10px', color: '#f8d848', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5));

    // Question counter
    this.container.add(this.scene.add.text(W - 10, 12, `Q${questionData.questionNumber}/${questionData.totalQuestions}`, {
      fontSize: '8px', color: '#a0a0a0', fontFamily: 'monospace',
    }).setOrigin(1, 0.5));

    // Score stars
    let stars = '';
    for (let i = 0; i < questionData.totalQuestions; i++) {
      stars += i < questionData.score ? '\u2605' : '\u2606';
    }
    this.container.add(this.scene.add.text(10, 12, stars, {
      fontSize: '8px', color: '#f8d848', fontFamily: 'monospace',
    }).setOrigin(0, 0.5));

    // Question text
    this.container.add(this.scene.add.text(W / 2, 50, questionData.question, {
      fontSize: '9px', color: '#f8f8f8', fontFamily: 'monospace',
      wordWrap: { width: W - 32 }, align: 'center',
    }).setOrigin(0.5));

    // Divider
    const divider = this.scene.add.rectangle(W / 2, 80, W - 32, 1, 0xc8b060, 0.5);
    this.container.add(divider);

    // Answer buttons
    const startY = 95;
    const btnH = 24;
    const btnW = W - 40;

    questionData.answers.forEach((answer, i) => {
      const y = startY + i * (btnH + 4);

      const bg = this.scene.add.rectangle(W / 2, y, btnW, btnH, 0x2a2a4e, 0.8);
      bg.setStrokeStyle(1, 0xc8b060, 0.5);

      const label = this.scene.add.text(32, y, answer.text, {
        fontSize: '8px', color: '#f8f8f8', fontFamily: 'monospace',
      }).setOrigin(0, 0.5);

      const cursor = this.scene.add.text(20, y, '\u25b6', {
        fontSize: '8px', color: '#f8d848', fontFamily: 'monospace',
      }).setOrigin(0, 0.5).setVisible(i === 0);

      // Touch support
      bg.setInteractive();
      bg.on('pointerdown', () => {
        if (!this.isWaiting) {
          this.selectedIndex = i;
          this.updateSelection();
          this.submitAnswer();
        }
      });

      this.answerButtons.push({ bg, label, cursor, answer });
      this.container.add(bg);
      this.container.add(label);
      this.container.add(cursor);
    });

    this.updateSelection();
  }

  moveSelection(delta) {
    if (this.isWaiting) return;
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + delta, 0, this.answerButtons.length);
    this.updateSelection();
  }

  updateSelection() {
    this.answerButtons.forEach((btn, i) => {
      btn.cursor.setVisible(i === this.selectedIndex);
      btn.bg.setStrokeStyle(1, i === this.selectedIndex ? 0xf8d848 : 0xc8b060, i === this.selectedIndex ? 1 : 0.5);
      btn.label.setColor(i === this.selectedIndex ? '#f8d848' : '#f8f8f8');
    });
  }

  submitAnswer() {
    if (this.isWaiting) return;
    this.isWaiting = true;
    if (this.onAnswer) this.onAnswer(this.selectedIndex);
  }

  showResult(result) {
    const W = GAME_CONFIG.WIDTH;

    // Highlight correct/incorrect
    this.answerButtons.forEach((btn, i) => {
      if (btn.answer.correct) {
        btn.bg.setFillStyle(GAME_CONFIG.COLORS.CORRECT, 0.4);
        btn.bg.setStrokeStyle(2, GAME_CONFIG.COLORS.CORRECT);
      } else if (i === this.selectedIndex && !result.correct) {
        btn.bg.setFillStyle(GAME_CONFIG.COLORS.INCORRECT, 0.4);
        btn.bg.setStrokeStyle(2, GAME_CONFIG.COLORS.INCORRECT);
      }
    });

    // Result text
    const resultText = result.correct ? 'Correct!' : 'Not quite!';
    const resultColor = result.correct ? '#40c040' : '#c04040';

    this.container.add(this.scene.add.text(W / 2, GAME_CONFIG.HEIGHT - 40, resultText, {
      fontSize: '10px', color: resultColor, fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5));

    // Fun fact
    this.container.add(this.scene.add.text(W / 2, GAME_CONFIG.HEIGHT - 24, result.funFact, {
      fontSize: '7px', color: '#a0a0a0', fontFamily: 'monospace',
      wordWrap: { width: W - 32 }, align: 'center',
    }).setOrigin(0.5));
  }

  showResults(results) {
    this.container.removeAll(true);
    this.answerButtons = [];

    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    this.container.add(this.scene.add.text(W / 2, 30, 'Quiz Complete!', {
      fontSize: '14px', color: '#f8d848', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5));

    this.container.add(this.scene.add.text(W / 2, 60, `Score: ${results.score} / ${results.total}`, {
      fontSize: '12px', color: '#f8f8f8', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Stars
    let stars = '';
    for (let i = 0; i < results.total; i++) {
      stars += i < results.score ? '\u2605' : '\u2606';
    }
    this.container.add(this.scene.add.text(W / 2, 85, stars, {
      fontSize: '16px', color: '#f8d848', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Rating message
    const messages = {
      perfect: 'Perfect! You really know Ben & Lou!',
      pass: 'Great job! You know the couple well!',
      fail: 'Nice try! Maybe talk to more guests for hints!',
    };
    this.container.add(this.scene.add.text(W / 2, 115, messages[results.rating], {
      fontSize: '8px', color: '#f8f8f8', fontFamily: 'monospace',
      wordWrap: { width: W - 40 }, align: 'center',
    }).setOrigin(0.5));

    this.container.add(this.scene.add.text(W / 2, 160, 'Press SPACE to continue', {
      fontSize: '7px', color: '#a0a0a0', fontFamily: 'monospace',
    }).setOrigin(0.5));
  }

  destroy() {
    this.container.destroy();
  }
}
