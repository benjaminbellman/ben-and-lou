class GuestbookScene extends Phaser.Scene {
  constructor() {
    super('GuestbookScene');
  }

  create() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e, 0.95).setDepth(0);

    // Title
    this.add.text(W / 2, 14, 'Guestbook', {
      fontSize: '14px', color: '#f8d848', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);

    // Subtitle
    this.add.text(W / 2, 28, 'Leave a message for Ben & Lou!', {
      fontSize: '7px', color: '#a0a0a0', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(1);

    // Messages area
    this.messagesContainer = this.add.container(0, 0).setDepth(1);

    // Load stored messages from localStorage
    this.messages = this.loadMessages();
    this.renderMessages();

    // Input form using DOM
    this.createInputForm();

    // Close button
    this.add.text(W - 8, 8, 'X', {
      fontSize: '10px', color: '#ff6666', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(2).setInteractive().on('pointerdown', () => this.closeGuestbook());

    // ESC / X to close
    this.input.keyboard.on('keydown-ESC', () => this.closeGuestbook());

    this.cameras.main.fadeIn(200);
  }

  createInputForm() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;
    const formY = H - 55;

    // Divider
    this.add.rectangle(W / 2, formY - 4, W - 16, 1, 0xc8b060, 0.3).setDepth(1);

    // Name label
    this.add.text(12, formY, 'Name:', {
      fontSize: '7px', color: '#f8d848', fontFamily: 'monospace',
    }).setDepth(1);

    // Name input background
    const nameInputBg = this.add.rectangle(W / 2 + 20, formY + 1, W - 60, 10, 0x2a2a4e, 0.8);
    nameInputBg.setStrokeStyle(1, 0xc8b060, 0.5).setDepth(1);

    // Message label
    this.add.text(12, formY + 16, 'Message:', {
      fontSize: '7px', color: '#f8d848', fontFamily: 'monospace',
    }).setDepth(1);

    // Message input background
    const msgInputBg = this.add.rectangle(W / 2, formY + 30, W - 24, 14, 0x2a2a4e, 0.8);
    msgInputBg.setStrokeStyle(1, 0xc8b060, 0.5).setDepth(1);

    // Editable text fields
    this.nameValue = '';
    this.messageValue = '';
    this.activeField = 'name';

    this.nameDisplay = this.add.text(48, formY - 2, '|', {
      fontSize: '7px', color: '#f8f8f8', fontFamily: 'monospace',
    }).setDepth(2);

    this.msgDisplay = this.add.text(14, formY + 26, '', {
      fontSize: '7px', color: '#f8f8f8', fontFamily: 'monospace',
      wordWrap: { width: W - 32 },
    }).setDepth(2);

    // Send button
    this.sendBtn = this.add.text(W - 12, formY + 46, '[Send]', {
      fontSize: '8px', color: '#40c040', fontFamily: 'monospace',
    }).setOrigin(1, 0).setDepth(2).setInteractive();
    this.sendBtn.on('pointerdown', () => this.submitMessage());

    // Make input areas clickable
    nameInputBg.setInteractive().on('pointerdown', () => { this.activeField = 'name'; this.updateFieldHighlight(); });
    msgInputBg.setInteractive().on('pointerdown', () => { this.activeField = 'message'; this.updateFieldHighlight(); });

    // Keyboard input
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape') return;
      if (event.key === 'Tab') {
        event.preventDefault();
        this.activeField = this.activeField === 'name' ? 'message' : 'name';
        this.updateFieldHighlight();
        return;
      }
      if (event.key === 'Enter') {
        if (this.activeField === 'name') {
          this.activeField = 'message';
          this.updateFieldHighlight();
        } else {
          this.submitMessage();
        }
        return;
      }
      if (event.key === 'Backspace') {
        if (this.activeField === 'name') {
          this.nameValue = this.nameValue.slice(0, -1);
        } else {
          this.messageValue = this.messageValue.slice(0, -1);
        }
        this.updateDisplays();
        return;
      }
      if (event.key.length === 1) {
        if (this.activeField === 'name' && this.nameValue.length < 20) {
          this.nameValue += event.key;
        } else if (this.activeField === 'message' && this.messageValue.length < 100) {
          this.messageValue += event.key;
        }
        this.updateDisplays();
      }
    });

    this.nameInputBg = nameInputBg;
    this.msgInputBg = msgInputBg;
    this.updateFieldHighlight();

    // Cursor blink
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateDisplays();
      },
      loop: true,
    });
    this.cursorVisible = true;
  }

  updateFieldHighlight() {
    const active = 0xf8d848;
    const inactive = 0xc8b060;
    this.nameInputBg.setStrokeStyle(1, this.activeField === 'name' ? active : inactive, this.activeField === 'name' ? 1 : 0.5);
    this.msgInputBg.setStrokeStyle(1, this.activeField === 'message' ? active : inactive, this.activeField === 'message' ? 1 : 0.5);
    this.updateDisplays();
  }

  updateDisplays() {
    const cursor = this.cursorVisible ? '|' : '';
    if (this.activeField === 'name') {
      this.nameDisplay.setText(this.nameValue + cursor);
      this.msgDisplay.setText(this.messageValue);
    } else {
      this.nameDisplay.setText(this.nameValue);
      this.msgDisplay.setText(this.messageValue + cursor);
    }
  }

  submitMessage() {
    if (!this.nameValue.trim() || !this.messageValue.trim()) return;

    const entry = {
      name: this.nameValue.trim(),
      message: this.messageValue.trim(),
      timestamp: new Date().toISOString(),
    };

    this.messages.push(entry);
    this.saveMessages();
    this.renderMessages();

    // Clear inputs
    this.nameValue = '';
    this.messageValue = '';
    this.activeField = 'name';
    this.updateDisplays();
    this.updateFieldHighlight();
  }

  renderMessages() {
    this.messagesContainer.removeAll(true);

    const W = GAME_CONFIG.WIDTH;
    let y = 42;
    const maxVisible = 5;
    const start = Math.max(0, this.messages.length - maxVisible);

    for (let i = start; i < this.messages.length; i++) {
      const msg = this.messages[i];
      const nameText = this.add.text(14, y, msg.name + ':', {
        fontSize: '7px', color: '#f8d848', fontFamily: 'monospace',
      });
      const msgText = this.add.text(14, y + 9, msg.message, {
        fontSize: '6px', color: '#c0c0c0', fontFamily: 'monospace',
        wordWrap: { width: W - 28 },
      });
      this.messagesContainer.add(nameText);
      this.messagesContainer.add(msgText);
      y += 22;
    }

    if (this.messages.length === 0) {
      const emptyText = this.add.text(W / 2, 80, 'No messages yet.\nBe the first to sign!', {
        fontSize: '7px', color: '#666666', fontFamily: 'monospace', align: 'center',
      }).setOrigin(0.5);
      this.messagesContainer.add(emptyText);
    }
  }

  loadMessages() {
    try {
      const data = localStorage.getItem('ben-lou-guestbook');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveMessages() {
    try {
      localStorage.setItem('ben-lou-guestbook', JSON.stringify(this.messages));
    } catch (e) {
      console.warn('Failed to save guestbook:', e);
    }
  }

  closeGuestbook() {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.on('camerafadeoutcomplete', () => {
      this.scene.stop();
      this.scene.resume('OverworldScene');
    });
  }
}
