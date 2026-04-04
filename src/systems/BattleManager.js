class BattleManager {
  constructor() {
    this.triviaData = {};
    this.currentSet = null;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.totalQuestions = 0;
  }

  loadTrivia(data) {
    this.triviaData = data;
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

    if (correct) this.score++;

    return {
      correct,
      correctAnswer: question.answers.find(a => a.correct).text,
      funFact: question.funFact,
      score: this.score,
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
    };
  }
}
