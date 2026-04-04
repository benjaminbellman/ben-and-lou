class BattleHUD {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(10);
    this.answerButtons = [];
    this.selectedIndex = 0;
    this.onAnswer = null;
    this.isWaiting = false;

    this.W = GAME_CONFIG.WIDTH;
    this.H = GAME_CONFIG.HEIGHT;
  }

  showIntro(enemyName, creatureKey, onComplete) {
    this.container.removeAll(true);

    // Flash effect
    const flash = this.scene.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0xffffff);
    this.container.add(flash);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
        this.showIntroText(enemyName, creatureKey, onComplete);
      }
    });
  }

  showIntroText(enemyName, creatureKey, onComplete) {
    this.container.removeAll(true);

    // Dark background
    this.container.add(this.scene.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x000000));

    // "Wild X appeared!" text
    const text = this.scene.add.text(this.W/2, this.H/2 - 20, `Wild ${enemyName} appeared!`, {
      fontSize: '11px', color: '#f8f8f8', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(text);

    // Show creature sliding in
    const creature = this.scene.add.image(this.W + 48, this.H/2 + 20, creatureKey + '-small');
    creature.setScale(4);
    this.container.add(creature);

    this.scene.tweens.add({
      targets: creature,
      x: this.W/2,
      duration: 600,
      ease: 'Power2',
    });

    // Continue after delay
    this.scene.time.delayedCall(1500, () => {
      if (onComplete) onComplete();
    });
  }

  showBattleField(playerCreature, enemyCreature, playerHP, enemyHP, maxPlayerHP, maxEnemyHP) {
    this.container.removeAll(true);
    this.answerButtons = [];

    // Battle background (already set by scene)

    // Enemy platform (top-right)
    const ePlat = this.scene.add.image(this.W - 56, 60, 'battle-platform-enemy');
    this.container.add(ePlat);

    // Enemy creature (using small sprite scaled up)
    this.enemySprite = this.scene.add.image(this.W - 56, 36, enemyCreature.spriteKey + '-small');
    this.enemySprite.setScale(3);
    this.container.add(this.enemySprite);

    // Player platform (bottom-left)
    const pPlat = this.scene.add.image(56, 130, 'battle-platform-player');
    this.container.add(pPlat);

    // Player creature (using small sprite scaled up, flipped for back view)
    this.playerSprite = this.scene.add.image(56, 104, playerCreature.spriteKey + '-small');
    this.playerSprite.setScale(3.5);
    this.playerSprite.setFlipX(true);
    this.container.add(this.playerSprite);

    // Enemy HP bar (top-left area, like Pokemon)
    this.drawHPBar(8, 8, enemyCreature.name, enemyHP, maxEnemyHP, 'enemy');

    // Player HP bar (bottom-right area)
    this.drawHPBar(this.W - 108, 96, playerCreature.name, playerHP, maxPlayerHP, 'player');
  }

  drawHPBar(x, y, name, hp, maxHP, side) {
    // Background box
    const bg = this.scene.add.rectangle(x + 50, y + 14, 100, 28, 0x2a2a3e, 0.9);
    bg.setStrokeStyle(1, 0xc8b060);
    this.container.add(bg);

    // Name
    this.container.add(this.scene.add.text(x + 6, y + 3, name, {
      fontSize: '7px', color: '#f8f8f8', fontFamily: 'monospace', fontStyle: 'bold',
    }));

    // HP label
    this.container.add(this.scene.add.text(x + 6, y + 14, 'HP', {
      fontSize: '6px', color: '#f8d848', fontFamily: 'monospace', fontStyle: 'bold',
    }));

    // HP bar background
    const barX = x + 20;
    const barY = y + 15;
    const barW = 72;
    const barH = 5;
    this.container.add(this.scene.add.rectangle(barX + barW/2, barY + barH/2, barW, barH, 0x333333));

    // HP bar fill
    const ratio = Math.max(0, hp / maxHP);
    const barColor = ratio > 0.5 ? 0x40c040 : ratio > 0.2 ? 0xc0c040 : 0xc04040;
    const fillW = Math.max(0, barW * ratio);
    const hpBar = this.scene.add.rectangle(barX + fillW/2, barY + barH/2, fillW, barH, barColor);
    this.container.add(hpBar);

    // HP numbers (player side only)
    if (side === 'player') {
      this.container.add(this.scene.add.text(x + 50, y + 22, `${hp}/${maxHP}`, {
        fontSize: '6px', color: '#a0a0a0', fontFamily: 'monospace',
      }).setOrigin(0.5, 0));
    }

    // Store refs for animation
    if (side === 'player') {
      this.playerHPBar = hpBar;
      this.playerHPText = null;
    } else {
      this.enemyHPBar = hpBar;
    }
  }

  showQuestion(questionData, playerCreature, enemyCreature) {
    // Clear only the bottom portion for the question/moves UI
    // Keep battlefield intact by rebuilding just the action area

    // Message box at bottom
    const msgBg = this.scene.add.rectangle(this.W/2, this.H - 28, this.W, 56, 0x1a1a3e, 0.95);
    msgBg.setStrokeStyle(2, 0xc8b060);
    this.container.add(msgBg);

    // Question text
    const qText = this.scene.add.text(this.W/2, this.H - 50, questionData.question, {
      fontSize: '7px', color: '#f8f8f8', fontFamily: 'monospace',
      wordWrap: { width: this.W - 24 }, align: 'center',
    }).setOrigin(0.5, 0);
    this.container.add(qText);

    // 2x2 answer grid (Pokemon move style)
    this.answerButtons = [];
    this.selectedIndex = 0;
    this.isWaiting = false;

    const gridX = 8;
    const gridY = this.H - 34;
    const cellW = (this.W - 24) / 2;
    const cellH = 14;

    questionData.answers.forEach((answer, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = gridX + col * (cellW + 4) + cellW/2;
      const cy = gridY + row * (cellH + 2) + cellH/2;

      const bg = this.scene.add.rectangle(cx, cy, cellW, cellH, 0x2a2a4e, 0.8);
      bg.setStrokeStyle(1, 0x666688);
      bg.setInteractive();

      const label = this.scene.add.text(cx, cy, answer.text, {
        fontSize: '6px', color: '#f8f8f8', fontFamily: 'monospace',
      }).setOrigin(0.5);

      bg.on('pointerdown', () => {
        if (!this.isWaiting) {
          this.selectedIndex = i;
          this.updateSelection();
          this.submitAnswer();
        }
      });

      this.answerButtons.push({ bg, label, answer });
      this.container.add(bg);
      this.container.add(label);
    });

    this.updateSelection();
  }

  moveSelection(delta) {
    if (this.isWaiting || this.answerButtons.length === 0) return;

    const cols = 2;
    const row = Math.floor(this.selectedIndex / cols);
    const col = this.selectedIndex % cols;

    if (delta === -1 && row > 0) this.selectedIndex -= cols; // up
    else if (delta === 1 && row < 1) this.selectedIndex += cols; // down
    else if (delta === -2 && col > 0) this.selectedIndex -= 1; // left
    else if (delta === 2 && col < 1) this.selectedIndex += 1; // right

    this.selectedIndex = Phaser.Math.Clamp(this.selectedIndex, 0, this.answerButtons.length - 1);
    this.updateSelection();
  }

  updateSelection() {
    this.answerButtons.forEach((btn, i) => {
      const selected = i === this.selectedIndex;
      btn.bg.setStrokeStyle(selected ? 2 : 1, selected ? 0xf8d848 : 0x666688);
      btn.label.setColor(selected ? '#f8d848' : '#f8f8f8');
    });
  }

  submitAnswer() {
    if (this.isWaiting) return;
    this.isWaiting = true;
    if (this.onAnswer) this.onAnswer(this.selectedIndex);
  }

  showAttackAnimation(correct, attackerIsPlayer, message, onComplete) {
    // Show attack message
    const msgY = this.H - 52;
    // Clear bottom area
    const msgBg = this.scene.add.rectangle(this.W/2, this.H - 28, this.W, 56, 0x1a1a3e, 0.95);
    msgBg.setStrokeStyle(2, 0xc8b060);
    this.container.add(msgBg);

    const msgText = this.scene.add.text(this.W/2, this.H - 36, message, {
      fontSize: '7px', color: '#f8f8f8', fontFamily: 'monospace',
      wordWrap: { width: this.W - 24 }, align: 'center',
    }).setOrigin(0.5);
    this.container.add(msgText);

    // Shake the creature that takes damage
    const target = attackerIsPlayer ? this.enemySprite : this.playerSprite;
    if (target) {
      // Flash white
      this.scene.tweens.add({
        targets: target,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          target.alpha = 1;
        }
      });
    }

    // Effectiveness text
    const effText = correct ? "It's super effective!" : "It's not very effective...";
    const effColor = correct ? '#40c040' : '#c08040';

    this.scene.time.delayedCall(600, () => {
      msgText.setText(effText);
      msgText.setColor(effColor);
    });

    this.scene.time.delayedCall(1400, () => {
      if (onComplete) onComplete();
    });
  }

  showFunFact(funFact, onComplete) {
    const msgBg = this.scene.add.rectangle(this.W/2, this.H - 28, this.W, 56, 0x1a1a3e, 0.95);
    msgBg.setStrokeStyle(2, 0xc8b060);
    this.container.add(msgBg);

    this.container.add(this.scene.add.text(this.W/2, this.H - 36, funFact, {
      fontSize: '6px', color: '#a0a0a0', fontFamily: 'monospace',
      wordWrap: { width: this.W - 24 }, align: 'center',
    }).setOrigin(0.5));

    this.scene.time.delayedCall(2000, () => {
      if (onComplete) onComplete();
    });
  }

  updateHP(side, hp, maxHP) {
    const bar = side === 'player' ? this.playerHPBar : this.enemyHPBar;
    if (!bar) return;

    const barW = 72;
    const ratio = Math.max(0, hp / maxHP);
    const barColor = ratio > 0.5 ? 0x40c040 : ratio > 0.2 ? 0xc0c040 : 0xc04040;
    const newW = Math.max(1, barW * ratio);

    this.scene.tweens.add({
      targets: bar,
      displayWidth: newW,
      duration: 400,
      onUpdate: () => {
        bar.setFillStyle(barColor);
      }
    });
  }

  showResults(results) {
    this.container.removeAll(true);
    this.answerButtons = [];

    // Background
    this.container.add(this.scene.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x1a1a2e));

    // Victory/defeat text
    const won = results.rating !== 'fail';
    this.container.add(this.scene.add.text(this.W/2, 25, won ? 'You won!' : 'You lost!', {
      fontSize: '14px', color: won ? '#f8d848' : '#c04040', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5));

    // Score
    this.container.add(this.scene.add.text(this.W/2, 50, `Score: ${results.score} / ${results.total}`, {
      fontSize: '10px', color: '#f8f8f8', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Stars
    let stars = '';
    for (let i = 0; i < results.total; i++) {
      stars += i < results.score ? '\u2605' : '\u2606';
    }
    this.container.add(this.scene.add.text(this.W/2, 70, stars, {
      fontSize: '14px', color: '#f8d848', fontFamily: 'monospace',
    }).setOrigin(0.5));

    // Rating message
    const messages = {
      perfect: 'Perfect! You really know Ben & Lou!',
      pass: 'Great job! You know the couple well!',
      fail: 'Nice try! Talk to more guests for hints!',
    };
    this.container.add(this.scene.add.text(this.W/2, 95, messages[results.rating], {
      fontSize: '8px', color: '#f8f8f8', fontFamily: 'monospace',
      wordWrap: { width: this.W - 40 }, align: 'center',
    }).setOrigin(0.5));

    // Badge earned notification
    if (won && results.badgeEarned) {
      this.container.add(this.scene.add.text(this.W/2, 125, 'Badge earned!', {
        fontSize: '9px', color: '#f8d848', fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(0.5));

      const badge = this.scene.add.image(this.W/2, 148, results.badgeEarned);
      badge.setScale(1.5);
      this.container.add(badge);

      this.scene.tweens.add({
        targets: badge,
        scaleX: 1.8,
        scaleY: 1.8,
        duration: 300,
        yoyo: true,
        repeat: 1,
      });
    }

    this.container.add(this.scene.add.text(this.W/2, this.H - 20, 'Press SPACE to continue', {
      fontSize: '7px', color: '#a0a0a0', fontFamily: 'monospace',
    }).setOrigin(0.5));
  }

  showCreatureEncounter(creatureName, creatureKey, onComplete) {
    this.container.removeAll(true);

    // Flash
    const flash = this.scene.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0xffffff);
    this.container.add(flash);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        // Show encounter screen
        this.container.removeAll(true);
        this.container.add(this.scene.add.rectangle(this.W/2, this.H/2, this.W, this.H, 0x2a4a2e));

        // Creature
        const sprite = this.scene.add.image(this.W/2, this.H/2 - 10, creatureKey + '-small');
        sprite.setScale(5);
        sprite.setAlpha(0);
        this.container.add(sprite);

        this.scene.tweens.add({
          targets: sprite,
          alpha: 1,
          scaleX: 2.5,
          scaleY: 2.5,
          duration: 500,
          ease: 'Back.easeOut',
        });

        // Text
        const text = this.scene.add.text(this.W/2, this.H - 40, `Wild ${creatureName} appeared!`, {
          fontSize: '10px', color: '#f8f8f8', fontFamily: 'monospace', fontStyle: 'bold',
        }).setOrigin(0.5);
        this.container.add(text);

        const subtext = this.scene.add.text(this.W/2, this.H - 24, 'Registered in Pokedex!', {
          fontSize: '7px', color: '#f8d848', fontFamily: 'monospace',
        }).setOrigin(0.5).setAlpha(0);
        this.container.add(subtext);

        this.scene.tweens.add({
          targets: subtext,
          alpha: 1,
          delay: 800,
          duration: 300,
        });

        this.scene.time.delayedCall(2500, () => {
          if (onComplete) onComplete();
        });
      }
    });
  }

  destroy() {
    this.container.destroy();
  }
}
