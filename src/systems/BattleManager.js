class BattleManager {
  constructor() {
    this.triviaData = {};
    this.currentSet = null;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.totalQuestions = 0;

    // Pokemon-style HP system
    this.playerHP = 0;
    this.maxPlayerHP = 0;
    this.enemyHP = 0;
    this.maxEnemyHP = 0;
    this.playerCreature = null;
    this.enemyCreature = null;
  }

  loadTrivia(data) {
    this.triviaData = data;
  }

  // Creature definitions for battles
  getPlayerCreature() {
    return {
      name: 'Ringbear',
      spriteKey: 'creature-ringbear',
      type: 'Love',
      maxHP: 100,
    };
  }

  getEnemyCreature(triviaSetId) {
    const enemies = {
      'bestman-trivia': { name: 'Cakemon', spriteKey: 'creature-cakemon', type: 'Sweet', maxHP: 100 },
    };
    return enemies[triviaSetId] || { name: 'Bouquettle', spriteKey: 'creature-bouquettle', type: 'Grass', maxHP: 100 };
  }

  startBattle(triviaSetId) {
    const set = this.triviaData[triviaSetId];
    if (!set) {
      console.warn(`Trivia set not found: ${triviaSetId}`);
      return null;
    }

    this.currentSet = set;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.totalQuestions = set.questions.length;

    // Set up creatures and HP
    this.playerCreature = this.getPlayerCreature();
    this.enemyCreature = this.getEnemyCreature(triviaSetId);
    this.maxPlayerHP = this.playerCreature.maxHP;
    this.maxEnemyHP = this.enemyCreature.maxHP;
    this.playerHP = this.maxPlayerHP;
    this.enemyHP = this.maxEnemyHP;

    return this.getCurrentQuestion();
  }

  getCurrentQuestion() {
    if (!this.currentSet || this.currentQuestionIndex >= this.totalQuestions) {
      return null;
    }
    return {
      ...this.currentSet.questions[this.currentQuestionIndex],
      questionNumber: this.currentQuestionIndex + 1,
      totalQuestions: this.totalQuestions,
      score: this.score,
    };
  }

  submitAnswer(answerIndex) {
    const question = this.currentSet.questions[this.currentQuestionIndex];
    const correct = question.answers[answerIndex].correct === true;

    // Damage calculation
    const damagePerQuestion = Math.ceil(this.maxEnemyHP / this.totalQuestions);
    const playerDamage = Math.ceil(this.maxPlayerHP / this.totalQuestions);

    if (correct) {
      this.score++;
      // Player attacks enemy - deal damage
      this.enemyHP = Math.max(0, this.enemyHP - damagePerQuestion);
    } else {
      // Enemy attacks player - take damage
      this.playerHP = Math.max(0, this.playerHP - playerDamage);
    }

    return {
      correct,
      correctAnswer: question.answers.find(a => a.correct).text,
      funFact: question.funFact,
      score: this.score,
      playerHP: this.playerHP,
      maxPlayerHP: this.maxPlayerHP,
      enemyHP: this.enemyHP,
      maxEnemyHP: this.maxEnemyHP,
      damageDealt: correct ? damagePerQuestion : 0,
      damageTaken: correct ? 0 : playerDamage,
    };
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    return this.getCurrentQuestion();
  }

  getResults() {
    const percentage = (this.score / this.totalQuestions) * 100;
    let rating;
    if (percentage === 100) rating = 'perfect';
    else if (percentage >= 60) rating = 'pass';
    else rating = 'fail';

    return {
      score: this.score,
      total: this.totalQuestions,
      percentage,
      rating,
      title: this.currentSet.title,
      playerCreature: this.playerCreature,
      enemyCreature: this.enemyCreature,
    };
  }
}
