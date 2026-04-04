class QuestManager {
  constructor(scene) {
    this.scene = scene;
    this.quests = {};      // quest definitions
    this.questState = {};  // runtime state
    this.flags = {};       // global flags
    this.onQuestUpdate = null;
  }

  loadQuests(data) {
    this.quests = {};
    data.forEach(q => {
      this.quests[q.id] = q;
    });
  }

  startQuest(questId) {
    if (this.questState[questId]) return; // already started
    this.questState[questId] = {
      status: 'active',
      currentStepIndex: 0,
      stepsComplete: {},
    };
    this.notifyUpdate();
  }

  advanceStep(questId, stepId) {
    const state = this.questState[questId];
    if (!state || state.status !== 'active') return;

    state.stepsComplete[stepId] = true;

    const quest = this.quests[questId];
    if (!quest) return;

    // Check if all steps are done
    const allDone = quest.steps.every(s => state.stepsComplete[s.id]);
    if (allDone) {
      this.completeQuest(questId);
    } else {
      // Advance to next incomplete step
      const nextIndex = quest.steps.findIndex(s => !state.stepsComplete[s.id]);
      if (nextIndex >= 0) state.currentStepIndex = nextIndex;
    }

    this.notifyUpdate();
  }

  completeQuest(questId) {
    const state = this.questState[questId];
    if (!state) return;
    state.status = 'complete';
    this.notifyUpdate();

    // Check if all quests are complete
    if (this.areAllQuestsComplete()) {
      this.scene.time.delayedCall(500, () => {
        this.scene.onAllQuestsComplete();
      });
    }
  }

  isQuestActive(questId) {
    const state = this.questState[questId];
    return state && state.status === 'active';
  }

  isQuestComplete(questId) {
    const state = this.questState[questId];
    return state && state.status === 'complete';
  }

  isStepComplete(questId, stepId) {
    const state = this.questState[questId];
    return state && state.stepsComplete[stepId];
  }

  getCurrentStep(questId) {
    const quest = this.quests[questId];
    const state = this.questState[questId];
    if (!quest || !state || state.status !== 'active') return null;
    return quest.steps[state.currentStepIndex] || null;
  }

  areAllQuestsComplete() {
    const questIds = Object.keys(this.quests);
    if (questIds.length === 0) return false;
    return questIds.every(id => this.isQuestComplete(id));
  }

  getFlag(flag) {
    return this.flags[flag];
  }

  setFlag(flag, value) {
    this.flags[flag] = value;
  }

  // Get NPC indicator type
  getNPCIndicator(npcId) {
    for (const questId of Object.keys(this.quests)) {
      const quest = this.quests[questId];
      const state = this.questState[questId];

      if (quest.giver === npcId) {
        if (!state) return 'available'; // Quest not started
        if (state.status === 'complete') return 'complete';
        // Check if there's a turn-in step for this NPC
        const currentStep = this.getCurrentStep(questId);
        if (currentStep && currentStep.target === npcId && currentStep.type === 'talk-to') {
          return 'ready';
        }
        return null; // Quest active but not ready for this NPC
      }
    }
    return null;
  }

  getState() {
    return {
      questState: this.questState,
      flags: this.flags,
    };
  }

  loadState(state) {
    if (state.questState) this.questState = state.questState;
    if (state.flags) this.flags = state.flags;
  }

  notifyUpdate() {
    if (this.onQuestUpdate) this.onQuestUpdate();

    // Auto-save
    if (this.scene.saveGame) {
      this.scene.saveGame();
    }
  }
}
