class PokedexManager {
  constructor() {
    this.creatures = {};  // all creature definitions
    this.discovered = {}; // { creatureId: true }
  }

  loadCreatures(data) {
    data.forEach(c => {
      this.creatures[c.id] = c;
    });
  }

  discover(creatureId) {
    if (this.discovered[creatureId]) return false; // already discovered
    this.discovered[creatureId] = true;
    return true; // newly discovered
  }

  isDiscovered(creatureId) {
    return this.discovered[creatureId] === true;
  }

  getCreature(creatureId) {
    return this.creatures[creatureId] || null;
  }

  getAllCreatures() {
    return Object.values(this.creatures);
  }

  getDiscoveredCount() {
    return Object.keys(this.discovered).length;
  }

  getTotalCount() {
    return Object.keys(this.creatures).length;
  }

  getCompletionPercent() {
    const total = this.getTotalCount();
    if (total === 0) return 0;
    return Math.round((this.getDiscoveredCount() / total) * 100);
  }

  getState() {
    return { discovered: this.discovered };
  }

  loadState(state) {
    if (state.discovered) this.discovered = state.discovered;
  }
}
