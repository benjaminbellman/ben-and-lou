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

    // Start battle
    const question = this.battleManager.startBattle(this.triviaSetId);
    if (!question) {
      this.endBattle();
      return;
    }

    question.title = this.battleManager.currentSet.title;
    this.battleHUD.showQuestion(question);
    this.battleHUD.onAnswer = (index) => this.onAnswer(index);

    this.showingResult = false;
    this.showingFinalResults = false;

    this.cameras.main.fadeIn(300);
  }

  update() {
    this.inputManager.update();

    if (this.showingFinalResults) {
      if (this.inputManager.isActionJustPressed()) {
        this.endBattle();
      }
      return;
    }

    if (this.showingResult) {
      if (this.inputManager.isActionJustPressed()) {
        this.nextQuestion();
      }
      return;
    }

    // Navigate answers
    const move = this.inputManager.getMovement();
    if (Phaser.Input.Keyboard.JustDown(this.inputManager.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.inputManager.wasd.W)) {
      this.battleHUD.moveSelection(-1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.inputManager.cursors.down) ||
        Phaser.Input.Keyboard.JustDown(this.inputManager.wasd.S)) {
      this.battleHUD.moveSelection(1);
    }

    if (this.inputManager.isActionJustPressed()) {
      this.battleHUD.submitAnswer();
    }
  }

  onAnswer(index) {
    const result = this.battleManager.submitAnswer(index);
    this.battleHUD.showResult(result);
    this.showingResult = true;
  }

  nextQuestion() {
    this.showingResult = false;
    const question = this.battleManager.nextQuestion();

    if (question) {
      question.title = this.battleManager.currentSet.title;
      this.battleHUD.showQuestion(question);
      this.battleHUD.onAnswer = (index) => this.onAnswer(index);
    } else {
      // Show final results
      const results = this.battleManager.getResults();
      this.battleHUD.showResults(results);
      this.showingFinalResults = true;
      this._results = results;
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
