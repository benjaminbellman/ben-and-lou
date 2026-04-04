class BadgeManager {
  constructor() {
    this.badges = {
      'bouquet': { id: 'bouquet', name: 'Bouquet Badge', spriteKey: 'badge-bouquet', questId: 'lost-bouquet', description: 'Found the lost bouquet' },
      'trivia': { id: 'trivia', name: 'Trivia Badge', spriteKey: 'badge-trivia', questId: 'bestman-quiz', description: 'Aced the trivia challenge' },
      'ring': { id: 'ring', name: 'Ring Badge', spriteKey: 'badge-ring', questId: 'ring-rescue', description: 'Rescued the wedding rings' },
      'memory': { id: 'memory', name: 'Memory Badge', spriteKey: 'badge-memory', questId: 'grandma-memories', description: "Heard Grandma's stories" },
    };
    this.earned = {};
  }

  earnBadge(badgeId) {
    if (this.earned[badgeId]) return false;
    this.earned[badgeId] = true;
    return true;
  }

  hasBadge(badgeId) {
    return this.earned[badgeId] === true;
  }

  getBadgeForQuest(questId) {
    return Object.values(this.badges).find(b => b.questId === questId) || null;
  }

  getEarnedCount() {
    return Object.keys(this.earned).length;
  }

  getTotalCount() {
    return Object.keys(this.badges).length;
  }

  getAllBadges() {
    return Object.values(this.badges);
  }

  getState() {
    return { earned: this.earned };
  }

  loadState(state) {
    if (state.earned) this.earned = state.earned;
  }
}
