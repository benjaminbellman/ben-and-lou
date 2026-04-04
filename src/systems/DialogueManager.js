class DialogueManager {
  constructor(scene, dialogueBox, choiceMenu) {
    this.scene = scene;
    this.dialogueBox = dialogueBox;
    this.choiceMenu = choiceMenu;
    this.dialogues = {};
    this.currentDialogue = null;
    this.currentNodeIndex = 0;
    this.isActive = false;
    this.onEnd = null;
    this.questManager = null;
  }

  setQuestManager(questManager) {
    this.questManager = questManager;
  }

  loadDialogues(data) {
    this.dialogues = data;
  }

  startDialogue(dialogueId, onEnd) {
    const dialogue = this.dialogues[dialogueId];
    if (!dialogue) {
      console.warn(`Dialogue not found: ${dialogueId}`);
      if (onEnd) onEnd();
      return;
    }

    this.currentDialogue = dialogue;
    this.currentNodeIndex = 0;
    this.isActive = true;
    this.onEnd = onEnd;

    this.showNode(this.currentDialogue.nodes[0]);
  }

  showNode(node) {
    if (!node) {
      this.endDialogue();
      return;
    }

    if (node.type === 'condition') {
      const result = this.evaluateCondition(node.condition);
      const nextId = result ? node.ifTrue : node.ifFalse;
      const nextNode = this.findNode(nextId);
      this.showNode(nextNode);
      return;
    }

    if (node.type === 'choice') {
      // Show the prompt text if present
      if (node.text) {
        this.dialogueBox.show(node.speaker || '', node.text, () => {
          this.showChoices(node.choices);
        });
      } else {
        this.showChoices(node.choices);
      }
      return;
    }

    // Regular text node
    // Execute any actions on this node
    if (node.action) {
      this.executeAction(node.action);
    }

    this.dialogueBox.show(node.speaker || '', node.text, () => {
      // Text complete, waiting for advance
    });

    this._currentNode = node;
  }

  showChoices(choices) {
    this.choiceMenu.show(choices, (choice) => {
      if (choice.action) {
        this.executeAction(choice.action);
      }
      if (choice.next) {
        const nextNode = this.findNode(choice.next);
        this.showNode(nextNode);
      } else {
        this.endDialogue();
      }
    });
  }

  advance() {
    if (!this.isActive) return;

    if (this.choiceMenu.isVisible) {
      this.choiceMenu.select();
      return;
    }

    // If still typing, skip to end
    if (this.dialogueBox.isTyping()) {
      this.dialogueBox.skipTypewriter();
      return;
    }

    // Move to next node
    const node = this._currentNode;
    if (node && node.next) {
      const nextNode = this.findNode(node.next);
      this.showNode(nextNode);
    } else {
      this.endDialogue();
    }
  }

  moveChoiceSelection(delta) {
    if (this.choiceMenu.isVisible) {
      this.choiceMenu.moveSelection(delta);
    }
  }

  findNode(id) {
    if (!id || !this.currentDialogue) return null;
    return this.currentDialogue.nodes.find(n => n.id === id) || null;
  }

  evaluateCondition(condition) {
    if (!this.questManager || !condition) return false;

    if (condition.quest) {
      const status = condition.status;
      if (status === 'active') return this.questManager.isQuestActive(condition.quest);
      if (status === 'complete') return this.questManager.isQuestComplete(condition.quest);
      if (status === 'not-started') return !this.questManager.isQuestActive(condition.quest) && !this.questManager.isQuestComplete(condition.quest);
    }

    if (condition.flag) {
      return this.questManager.getFlag(condition.flag) === condition.value;
    }

    return false;
  }

  executeAction(action) {
    if (!action) return;

    if (action.type === 'start-quest' && this.questManager) {
      this.questManager.startQuest(action.questId);
    }
    if (action.type === 'advance-quest' && this.questManager) {
      this.questManager.advanceStep(action.questId, action.stepId);
    }
    if (action.type === 'complete-quest' && this.questManager) {
      this.questManager.completeQuest(action.questId);
    }
    if (action.type === 'set-flag' && this.questManager) {
      this.questManager.setFlag(action.flag, action.value);
    }
    if (action.type === 'start-battle') {
      this.endDialogue();
      this.scene.startBattle(action.triviaSetId);
    }
    if (action.type === 'open-guestbook') {
      this.endDialogue();
      this.scene.openGuestbook();
    }
  }

  endDialogue() {
    this.isActive = false;
    this.currentDialogue = null;
    this._currentNode = null;
    this.dialogueBox.hide();
    this.choiceMenu.hide();
    if (this.onEnd) this.onEnd();
  }
}
