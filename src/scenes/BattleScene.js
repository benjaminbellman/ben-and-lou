class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');
  }

  init(data) {
    this.triviaSetId = data.triviaSetId;
    this.battleManager = data.battleManager;
  }

  create() {
    // Background
    this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'battle-bg');

    // HUD
    this.battleHUD = new BattleHUD(this);

    // Input
    this.inputManager = new InputManager(this);

    // Get creature data
    this.playerCreature = this.battleManager.getPlayerCreature();
    this.enemyCreature = this.battleManager.getEnemyCreature(this.triviaSetId);

    // Start battle directly
    const question = this.battleManager.startBattle(this.triviaSetId);
    if (!question) {
      this.endBattle();
      return;
    }

    // Show battlefield with "Wild X appeared!" message
    this.battleState = 'intro';
    this.showBattleField(question);

    // Show intro message over battlefield
    const msgBg = this.add.rectangle(GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT - 28, GAME_CONFIG.WIDTH, 56, 0x1a1a3e, 0.95).setDepth(50);
    msgBg.setStrokeStyle(2, 0xc8b060);
    const introText = this.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 28,
      'Wild ' + this.enemyCreature.name + ' appeared!', {
      fontSize: '10px', color: '#f8f8f8', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(51);

    // Wait for player to press action to continue
    this.introElements = [msgBg, introText];
    const advanceIntro = () => {
      if (this.battleState !== 'intro') return;
      msgBg.destroy();
      introText.destroy();
      this.battleState = 'question';
      const q = this.battleManager.getCurrentQuestion();
      q.title = this.battleManager.currentSet.title;
      this.battleHUD.showQuestion(q, this.playerCreature, this.enemyCreature);
      this.battleHUD.onAnswer = (index) => this.onAnswer(index);
    };

    // Auto-advance after 1.5s OR on keypress
    this.input.keyboard.once('keydown-SPACE', advanceIntro);
    this.input.keyboard.once('keydown-ENTER', advanceIntro);
    this.input.keyboard.once('keydown-Z', advanceIntro);
    this.input.once('pointerdown', advanceIntro);
    this.time.delayedCall(2000, advanceIntro);

    this.showingFinalResults = false;
    this.cameras.main.fadeIn(300);
  }

  showBattleField(question) {
    this.battleHUD.showBattleField(
      this.playerCreature, this.enemyCreature,
      this.battleManager.playerHP, this.battleManager.enemyHP,
      this.battleManager.maxPlayerHP, this.battleManager.maxEnemyHP
    );
  }

  update() {
    this.inputManager.update();

    if (this.battleState === 'intro') return;

    if (this.showingFinalResults) {
      if (this.inputManager.isActionJustPressed()) {
        this.endBattle();
      }
      return;
    }

    if (this.battleState === 'question') {
      if (Phaser.Input.Keyboard.JustDown(this.inputManager.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.inputManager.wasd.W)) {
        this.battleHUD.moveSelection(-1);
      }
      if (Phaser.Input.Keyboard.JustDown(this.inputManager.cursors.down) ||
          Phaser.Input.Keyboard.JustDown(this.inputManager.wasd.S)) {
        this.battleHUD.moveSelection(1);
      }
      if (Phaser.Input.Keyboard.JustDown(this.inputManager.cursors.left) ||
          Phaser.Input.Keyboard.JustDown(this.inputManager.wasd.A)) {
        this.battleHUD.moveSelection(-2);
      }
      if (Phaser.Input.Keyboard.JustDown(this.inputManager.cursors.right) ||
          Phaser.Input.Keyboard.JustDown(this.inputManager.wasd.D)) {
        this.battleHUD.moveSelection(2);
      }

      if (this.inputManager.isActionJustPressed()) {
        this.battleHUD.submitAnswer();
      }
    }
  }

  onAnswer(index) {
    const result = this.battleManager.submitAnswer(index);
    this.battleState = 'answer-result';

    const attackerName = result.correct ? this.playerCreature.name : this.enemyCreature.name;
    const message = attackerName + ' used Trivia!';

    this.battleHUD.showAttackAnimation(result.correct, result.correct, message, () => {
      this.battleHUD.updateHP('player', result.playerHP, result.maxPlayerHP);
      this.battleHUD.updateHP('enemy', result.enemyHP, result.maxEnemyHP);

      this.battleState = 'fun-fact';
      this.time.delayedCall(600, () => {
        this.battleHUD.showFunFact(result.funFact, () => {
          this.advanceToNext();
        });
      });
    });
  }

  advanceToNext() {
    const question = this.battleManager.nextQuestion();

    if (question) {
      this.showBattleField(question);
      this.battleState = 'question';
      question.title = this.battleManager.currentSet.title;
      this.battleHUD.showQuestion(question, this.playerCreature, this.enemyCreature);
      this.battleHUD.onAnswer = (index) => this.onAnswer(index);
    } else {
      const results = this.battleManager.getResults();
      if (results.rating !== 'fail') {
        results.badgeEarned = 'badge-trivia';
      }
      this._results = results;
      this.showingFinalResults = true;
      this.battleState = 'results';
      this.battleHUD.showResults(results);
    }
  }

  endBattle() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.on('camerafadeoutcomplete', () => {
      const overworldScene = this.scene.get('OverworldScene');
      if (overworldScene && this._results) {
        overworldScene.onBattleComplete(this._results);
      }
      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }
}
