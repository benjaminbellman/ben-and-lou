class OverworldScene extends Phaser.Scene {
  constructor() {
    super('OverworldScene');
  }

  init(data) {
    this.loadSave = data && data.loadSave;
  }

  create() {
    const T = GAME_CONFIG.TILE_SIZE;
    const MW = GAME_CONFIG.MAP_WIDTH;
    const MH = GAME_CONFIG.MAP_HEIGHT;

    // Build the tilemap procedurally
    this.buildMap(MW, MH, T);

    // Input manager
    this.inputManager = new InputManager(this);

    // Player
    this.player = new Player(this, 14, 20);
    this.player.setCollisionCallback((x, y) => this.checkCollision(x, y));

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, MW * T, MH * T);
    this.cameras.main.setZoom(1);
    this.cameras.main.fadeIn(500);

    // NPCs
    this.npcs = [];
    this.loadNPCs();

    // Interactable objects
    this.interactables = [];
    this.createInteractables();

    // UI systems
    this.dialogueBox = new DialogueBox(this);
    this.choiceMenu = new ChoiceMenu(this);
    this.dialogueManager = new DialogueManager(this, this.dialogueBox, this.choiceMenu);
    this.questManager = new QuestManager(this);
    this.battleManager = new BattleManager();

    this.dialogueManager.setQuestManager(this.questManager);

    // Load game data
    this.loadGameData();

    // Quest log
    this.questLog = new QuestLog(this, this.questManager);
    this.input.keyboard.on('keydown-Q', () => {
      if (!this.dialogueManager.isActive) {
        this.questLog.toggle();
      }
    });

    // Touch controls
    this.touchControls = new TouchControls(this, this.inputManager);

    // Quest update handler
    this.questManager.onQuestUpdate = () => this.updateNPCIndicators();

    // Load save if applicable
    if (this.loadSave) {
      const save = SaveManager.load();
      if (save) {
        this.player.setPosition(save.playerX || 14 * T, save.playerY || 20 * T);
        this.questManager.loadState(save);
        if (save.collectedItems) {
          this.removeCollectedItems(save.collectedItems);
        }
      }
    }

    // Initial indicator update
    this.updateNPCIndicators();

    // Interaction state
    this.isInteracting = false;
  }

  buildMap(MW, MH, T) {
    // Create tilemap data
    const mapData = new Phaser.Tilemaps.MapData({
      width: MW,
      height: MH,
      tileWidth: T,
      tileHeight: T,
    });

    this.map = new Phaser.Tilemaps.Tilemap(this, mapData);
    const tileset = this.map.addTilesetImage('tileset', 'tileset', T, T, 0, 0);

    // Ground layer
    const groundData = this.generateGroundLayer(MW, MH);
    const groundLayer = this.map.createBlankLayer('ground', tileset, 0, 0, MW, MH, T, T);
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        groundLayer.putTileAt(groundData[y][x], x, y);
      }
    }

    // Objects layer (with collision)
    const objectData = this.generateObjectLayer(MW, MH);
    const objectLayer = this.map.createBlankLayer('objects', tileset, 0, 0, MW, MH, T, T);
    for (let y = 0; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        if (objectData[y][x] >= 0) {
          const tile = objectLayer.putTileAt(objectData[y][x], x, y);
          tile.setCollision(true);
        }
      }
    }

    // Store for collision checking
    this.groundLayer = groundLayer;
    this.objectLayer = objectLayer;
    this.collisionData = objectData;

    // Set world bounds
    this.physics.world.setBounds(0, 0, MW * T, MH * T);
  }

  generateGroundLayer(MW, MH) {
    const data = [];
    for (let y = 0; y < MH; y++) {
      data[y] = [];
      for (let x = 0; x < MW; x++) {
        data[y][x] = 0; // default grass
      }
    }

    // Garden entrance area (bottom)
    for (let y = 18; y < MH; y++) {
      for (let x = 0; x < MW; x++) {
        data[y][x] = 0; // grass
      }
    }

    // Scattered flowers in garden
    const flowerPositions = [[2,19],[5,21],[8,20],[12,22],[18,19],[22,21],[26,20],[3,23],[15,23],[20,22]];
    flowerPositions.forEach(([x,y]) => {
      if (x < MW && y < MH) data[y][x] = 7;
    });

    // Main path from bottom to venue
    for (let y = 15; y < MH; y++) {
      for (let x = 13; x <= 16; x++) {
        if (x < MW && y < MH) data[y][x] = 1; // stone path
      }
    }

    // Red carpet approach to ceremony
    for (let y = 8; y <= 14; y++) {
      for (let x = 14; x <= 15; x++) {
        data[y][x] = 5; // red carpet
      }
    }

    // Ceremony area (center-north) - tile floor
    for (let y = 3; y <= 8; y++) {
      for (let x = 10; x <= 19; x++) {
        data[y][x] = 3; // tile floor
      }
    }

    // Reception hall (right side) - wood floor
    for (let y = 10; y <= 18; y++) {
      for (let x = 20; x <= 28; x++) {
        data[y][x] = 2; // wood floor
      }
    }

    // Bar area within reception
    for (let y = 14; y <= 17; y++) {
      for (let x = 24; x <= 27; x++) {
        data[y][x] = 27; // rug
      }
    }

    // Seating area (left side)
    for (let y = 14; y <= 20; y++) {
      for (let x = 2; x <= 9; x++) {
        data[y][x] = 1; // stone path
      }
    }

    // Fountain area
    data[21][14] = 4; data[21][15] = 4; // water around fountain
    data[22][14] = 4; data[22][15] = 4;

    // Paths connecting areas
    for (let x = 10; x <= 19; x++) {
      data[9][x] = 1;
    }
    for (let x = 16; x <= 20; x++) {
      data[12][x] = 1;
    }
    for (let x = 9; x <= 14; x++) {
      data[14][x] = 1;
    }

    return data;
  }

  generateObjectLayer(MW, MH) {
    // -1 means no object (passable)
    const data = [];
    for (let y = 0; y < MH; y++) {
      data[y] = [];
      for (let x = 0; x < MW; x++) {
        data[y][x] = -1;
      }
    }

    // Map borders - trees and bushes
    for (let x = 0; x < MW; x++) {
      data[0][x] = 11; // trees on top
      data[1][x] = 12; // bushes below trees
      if (x < 10 || x > 19) data[MH - 1][x] = 12; // bushes on bottom edges
    }
    for (let y = 0; y < MH; y++) {
      data[y][0] = 11;
      data[y][MW - 1] = 11;
    }

    // Ceremony area walls/structure
    for (let x = 10; x <= 19; x++) {
      data[2][x] = 9; // wall top
    }
    data[2][10] = 13; // columns
    data[2][19] = 13;

    // Ceremony archway
    data[3][14] = 24; data[3][15] = 24;

    // Ceremony benches (seating rows)
    for (let row of [5, 7]) {
      data[row][11] = 22; data[row][12] = 22; // left benches
      data[row][17] = 22; data[row][18] = 22; // right benches
    }

    // Reception hall structure
    for (let y = 10; y <= 18; y++) {
      data[y][20] = (y === 12) ? -1 : 10; // left wall with entrance
    }
    for (let x = 20; x <= 28; x++) {
      data[10][x] = 9; // top wall
    }
    data[10][28] = 15; // window

    // Tables in reception
    data[12][22] = 16; data[12][23] = 17; // table + chair
    data[12][25] = 16; data[12][26] = 17;
    data[15][22] = 16; data[15][23] = 17;
    data[15][25] = 16;

    // Bar area
    data[14][26] = 18; data[14][27] = 18; // barrels
    data[16][27] = 16; // bar table

    // Wedding cake (reception)
    data[11][24] = 19;

    // Garden decorations
    data[16][4] = 20; // flower pot
    data[16][8] = 20;
    data[19][6] = 25; // lanterns
    data[19][9] = 25;

    // Seating area items
    data[15][3] = 22; data[15][4] = 22; // benches
    data[17][3] = 22; data[17][4] = 22;
    data[15][7] = 22; data[15][8] = 22;
    data[17][7] = 22; data[17][8] = 22;

    // Fountain
    data[21][14] = 23; // fountain (visual on ground layer too)

    // Sign near entrance
    data[20][12] = 21;

    // Guestbook stand
    data[13][21] = 31;

    // Garden entrance lanterns
    data[18][13] = 25;
    data[18][16] = 25;

    // Banners
    data[4][10] = 26;
    data[4][19] = 26;

    // Extra trees/bushes for aesthetics
    data[10][2] = 11; data[10][3] = 11;
    data[10][7] = 12; data[10][8] = 12;
    data[20][3] = 12; data[20][8] = 12;
    data[22][3] = 11; data[22][8] = 11;
    data[22][22] = 12; data[22][26] = 11;

    // Fence along the garden path
    for (let y = 19; y <= 22; y++) {
      data[y][11] = 10;
      data[y][18] = 10;
    }

    return data;
  }

  checkCollision(targetX, targetY) {
    const T = GAME_CONFIG.TILE_SIZE;
    const tileX = Math.round(targetX / T);
    const tileY = Math.round(targetY / T);

    // Out of bounds
    if (tileX < 0 || tileX >= GAME_CONFIG.MAP_WIDTH || tileY < 0 || tileY >= GAME_CONFIG.MAP_HEIGHT) {
      return true;
    }

    // Object collision
    if (this.collisionData[tileY] && this.collisionData[tileY][tileX] >= 0) {
      return true;
    }

    // NPC collision
    for (const npc of this.npcs) {
      const npcTile = npc.getTilePos();
      if (npcTile.x === tileX && npcTile.y === tileY) {
        return true;
      }
    }

    // Interactable collision
    for (const obj of this.interactables) {
      if (obj.active && obj.tileX === tileX && obj.tileY === tileY) {
        return true;
      }
    }

    return false;
  }

  loadNPCs() {
    // Load NPC data (embedded since we can't fetch JSON synchronously in this setup)
    const npcData = [
      { id: 'lou', name: 'Lou', spriteKey: 'npc-lou', tileX: 15, tileY: 6, direction: 'down', dialogueId: 'lou-main', questId: 'lost-bouquet' },
      { id: 'ben', name: 'Ben', spriteKey: 'npc-ben', tileX: 16, tileY: 6, direction: 'down', dialogueId: 'ben-main' },
      { id: 'bestman', name: 'Best Man', spriteKey: 'npc-bestman', tileX: 24, tileY: 16, direction: 'left', dialogueId: 'bestman-main', questId: 'bestman-quiz' },
      { id: 'moh', name: 'Maid of Honor', spriteKey: 'npc-moh', tileX: 5, tileY: 12, direction: 'right', dialogueId: 'moh-main', questId: 'ring-rescue' },
      { id: 'grandma', name: 'Grandma', spriteKey: 'npc-grandma', tileX: 7, tileY: 18, direction: 'down', dialogueId: 'grandma-main', questId: 'grandma-memories' },
    ];

    npcData.forEach(data => {
      const npc = new NPC(this, data);
      this.npcs.push(npc);
    });
  }

  createInteractables() {
    const T = GAME_CONFIG.TILE_SIZE;

    // Bouquet (for lost-bouquet quest) - near fountain
    this.addInteractable('bouquet', 'item-bouquet', 16, 22, 'bouquet-found', 'lost-bouquet');

    // Ring 1 - near tables in reception
    this.addInteractable('ring1', 'item-ring', 23, 13, 'ring1-found', 'ring-rescue');

    // Ring 2 - in the garden bushes
    this.addInteractable('ring2', 'item-ring', 3, 20, 'ring2-found', 'ring-rescue');

    // Static interactables (always present)
    this.addStaticInteractable('guestbook', 21, 13, 'guestbook-interact');
    this.addStaticInteractable('sign', 12, 20, 'sign-interact');
    this.addStaticInteractable('cake', 24, 11, 'cake-interact');
    this.addStaticInteractable('fountain', 14, 21, 'fountain-interact');
  }

  addInteractable(id, spriteKey, tileX, tileY, dialogueId, questId) {
    const T = GAME_CONFIG.TILE_SIZE;
    const sprite = this.add.image(tileX * T, tileY * T, spriteKey);
    sprite.setDepth(4);

    // Add sparkle
    const sparkle = this.add.image(tileX * T, tileY * T - 8, 'sparkle');
    sparkle.setDepth(4);
    sparkle.setAlpha(0.7);
    this.tweens.add({
      targets: sparkle,
      alpha: 0.3,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.interactables.push({
      id, tileX, tileY, dialogueId, questId,
      sprite, sparkle, active: true, isStatic: false,
    });
  }

  addStaticInteractable(id, tileX, tileY, dialogueId) {
    this.interactables.push({
      id, tileX, tileY, dialogueId,
      sprite: null, sparkle: null, active: true, isStatic: true,
    });
  }

  removeCollectedItems(collectedItems) {
    collectedItems.forEach(id => {
      const obj = this.interactables.find(o => o.id === id && !o.isStatic);
      if (obj) {
        obj.active = false;
        if (obj.sprite) obj.sprite.setVisible(false);
        if (obj.sparkle) obj.sparkle.setVisible(false);
      }
    });
  }

  loadGameData() {
    // Dialogues (embedded)
    const dialogues = {
      "lou-main": {"nodes":[{"id":"start","type":"condition","condition":{"quest":"lost-bouquet","status":"complete"},"ifTrue":"complete","ifFalse":"check-active"},{"id":"check-active","type":"condition","condition":{"quest":"lost-bouquet","status":"active"},"ifTrue":"active","ifFalse":"intro"},{"id":"intro","speaker":"Lou","text":"Oh no! I can't find my bouquet anywhere! I had it just a moment ago...","next":"intro2"},{"id":"intro2","speaker":"Lou","text":"I think I left it near the fountain in the garden. Could you find it for me?","next":"intro-choice"},{"id":"intro-choice","type":"choice","choices":[{"text":"I'll find it!","next":"accept","action":{"type":"start-quest","questId":"lost-bouquet"}},{"text":"Maybe later","next":"decline"}]},{"id":"accept","speaker":"Lou","text":"Thank you so much! I think it's somewhere near the fountain area.","next":null},{"id":"decline","speaker":"Lou","text":"Oh... okay. Come back if you change your mind!","next":null},{"id":"active","speaker":"Lou","text":"Any luck finding my bouquet? I think it was near the fountain...","next":null},{"id":"complete","speaker":"Lou","text":"My bouquet looks so beautiful! Thank you for finding it! This wedding is going to be perfect!","next":null}]},
      "ben-main": {"nodes":[{"id":"start","speaker":"Ben","text":"Welcome to our wedding! I'm so glad you could make it!","next":"ben2"},{"id":"ben2","speaker":"Ben","text":"Feel free to explore and talk to everyone. There's a lot to see and do!","next":"ben3"},{"id":"ben3","speaker":"Ben","text":"And don't forget to sign the guestbook before you leave!","next":null}]},
      "bestman-main": {"nodes":[{"id":"start","type":"condition","condition":{"quest":"bestman-quiz","status":"complete"},"ifTrue":"complete","ifFalse":"check-active"},{"id":"check-active","type":"condition","condition":{"quest":"bestman-quiz","status":"active"},"ifTrue":"active","ifFalse":"intro"},{"id":"intro","speaker":"Best Man","text":"Hey there! Think you know Ben and Lou pretty well?","next":"intro2"},{"id":"intro2","speaker":"Best Man","text":"I've got a little trivia challenge for you! Answer my questions about the happy couple!","next":"intro-choice"},{"id":"intro-choice","type":"choice","choices":[{"text":"Bring it on!","next":"start-quiz","action":{"type":"start-quest","questId":"bestman-quiz"}},{"text":"Not right now","next":"decline"}]},{"id":"start-quiz","speaker":"Best Man","text":"Alright, let's see what you know!","action":{"type":"start-battle","triviaSetId":"bestman-trivia"},"next":null},{"id":"decline","speaker":"Best Man","text":"No worries! Come back when you're ready for the challenge!","next":null},{"id":"active","speaker":"Best Man","text":"Ready to try the trivia again?","next":"retry-choice"},{"id":"retry-choice","type":"choice","choices":[{"text":"Let's go!","next":"start-quiz"},{"text":"Maybe later","next":"decline"}]},{"id":"complete","speaker":"Best Man","text":"You really know Ben and Lou! Great job on that trivia!","next":null}]},
      "moh-main": {"nodes":[{"id":"start","type":"condition","condition":{"quest":"ring-rescue","status":"complete"},"ifTrue":"complete","ifFalse":"check-active"},{"id":"check-active","type":"condition","condition":{"quest":"ring-rescue","status":"active"},"ifTrue":"active","ifFalse":"intro"},{"id":"intro","speaker":"Maid of Honor","text":"Oh thank goodness you're here! The ring bearer dropped the rings somewhere!","next":"intro2"},{"id":"intro2","speaker":"Maid of Honor","text":"I need you to find both wedding rings before the ceremony! I think they rolled off in different directions...","next":"intro-choice"},{"id":"intro-choice","type":"choice","choices":[{"text":"I'll find them!","next":"accept","action":{"type":"start-quest","questId":"ring-rescue"}},{"text":"Not now","next":"decline"}]},{"id":"accept","speaker":"Maid of Honor","text":"Check near the tables and around the garden! They could be anywhere!","next":null},{"id":"decline","speaker":"Maid of Honor","text":"Please hurry back! We need those rings!","next":null},{"id":"active","speaker":"Maid of Honor","text":"Have you found the rings yet? Keep looking near the tables and garden!","next":null},{"id":"complete","speaker":"Maid of Honor","text":"You found both rings! You're a lifesaver! The ceremony can go on!","next":null}]},
      "grandma-main": {"nodes":[{"id":"start","type":"condition","condition":{"quest":"grandma-memories","status":"complete"},"ifTrue":"complete","ifFalse":"check-active"},{"id":"check-active","type":"condition","condition":{"quest":"grandma-memories","status":"active"},"ifTrue":"active","ifFalse":"intro"},{"id":"intro","speaker":"Grandma","text":"Oh hello, dear! Come sit with me for a moment.","next":"intro2"},{"id":"intro2","speaker":"Grandma","text":"I have some wonderful memories of Ben and Lou I'd love to share. Would you like to hear them?","next":"intro-choice"},{"id":"intro-choice","type":"choice","choices":[{"text":"I'd love to!","next":"story1","action":{"type":"start-quest","questId":"grandma-memories"}},{"text":"Maybe later","next":"decline"}]},{"id":"story1","speaker":"Grandma","text":"I remember the first time Ben brought Lou home for the holidays. They were both so nervous!","next":"story1b"},{"id":"story1b","speaker":"Grandma","text":"But by the end of dinner, it felt like Lou had always been part of the family.","next":"story2"},{"id":"story2","speaker":"Grandma","text":"And then there was the time they tried to bake a cake together for my birthday...","next":"story2b"},{"id":"story2b","speaker":"Grandma","text":"Let's just say the fire department was NOT amused! But the thought was sweet.","next":"story3"},{"id":"story3","speaker":"Grandma","text":"I always knew they were meant for each other. You can see it in the way they look at each other.","next":"story3b"},{"id":"story3b","speaker":"Grandma","text":"I'm so happy to be here today. Thank you for listening to an old woman's stories!","action":{"type":"complete-quest","questId":"grandma-memories"},"next":null},{"id":"decline","speaker":"Grandma","text":"That's alright, dear. Come back anytime. I'm not going anywhere!","next":null},{"id":"active","speaker":"Grandma","text":"Come, sit! Let me tell you more stories...","next":"story1"},{"id":"complete","speaker":"Grandma","text":"Thank you for listening to my stories, dear. This is such a beautiful day!","next":null}]},
      "bouquet-found": {"nodes":[{"id":"start","speaker":"","text":"You found Lou's bouquet! It's a beautiful arrangement of roses and lilies.","action":{"type":"complete-quest","questId":"lost-bouquet"},"next":null}]},
      "ring1-found": {"nodes":[{"id":"start","speaker":"","text":"You found one of the wedding rings! It was hiding under a table. One more to go!","action":{"type":"advance-quest","questId":"ring-rescue","stepId":"find-ring-1"},"next":null}]},
      "ring2-found": {"nodes":[{"id":"start","speaker":"","text":"You found the second ring! It was caught in the bushes. Take them back to the Maid of Honor!","action":{"type":"advance-quest","questId":"ring-rescue","stepId":"find-ring-2"},"next":null}]},
      "guestbook-interact": {"nodes":[{"id":"start","speaker":"","text":"A beautiful guestbook sits open on the stand. Would you like to sign it?","next":"choice"},{"id":"choice","type":"choice","choices":[{"text":"Sign the guestbook","action":{"type":"open-guestbook"},"next":null},{"text":"Maybe later","next":null}]}]},
      "sign-interact": {"nodes":[{"id":"start","speaker":"","text":"A wooden sign reads: 'Welcome to Ben & Lou's Wedding! Explore, have fun, and don't forget to sign the guestbook!'","next":null}]},
      "cake-interact": {"nodes":[{"id":"start","speaker":"","text":"A magnificent three-tier wedding cake! It's decorated with delicate sugar flowers and topped with two tiny figures.","next":null}]},
      "fountain-interact": {"nodes":[{"id":"start","speaker":"","text":"A beautiful stone fountain. Coins glitter at the bottom - looks like guests have been making wishes!","next":null}]},
    };
    this.dialogueManager.loadDialogues(dialogues);

    // Quests
    const quests = [
      { id: 'lost-bouquet', title: 'The Lost Bouquet', description: "Find Lou's missing bouquet near the fountain", giver: 'lou', steps: [{ id: 'find-bouquet', description: 'Find the bouquet near the fountain', type: 'interact', target: 'bouquet' }] },
      { id: 'bestman-quiz', title: "The Best Man's Quiz", description: "Answer the Best Man's trivia questions about Ben & Lou", giver: 'bestman', steps: [{ id: 'complete-trivia', description: 'Complete the trivia challenge', type: 'battle', target: 'bestman-trivia' }] },
      { id: 'ring-rescue', title: 'Ring Bearer Rescue', description: 'Find both wedding rings that the ring bearer dropped', giver: 'moh', steps: [{ id: 'find-ring-1', description: 'Find the first ring near the tables', type: 'interact', target: 'ring1' }, { id: 'find-ring-2', description: 'Find the second ring in the garden', type: 'interact', target: 'ring2' }] },
      { id: 'grandma-memories', title: "Grandma's Memories", description: "Listen to Grandma's stories about Ben & Lou", giver: 'grandma', steps: [{ id: 'listen-stories', description: "Listen to Grandma's three stories", type: 'talk', target: 'grandma' }] },
    ];
    this.questManager.loadQuests(quests);

    // Trivia
    const trivia = {
      "bestman-trivia": {
        title: "Best Man's Challenge",
        questions: [
          { question: "Where did Ben and Lou first meet?", answers: [{ text: "At a coffee shop" }, { text: "Through mutual friends", correct: true }, { text: "At work" }, { text: "At a concert" }], funFact: "They were introduced by a mutual friend at a dinner party!" },
          { question: "What was their first date?", answers: [{ text: "A fancy restaurant" }, { text: "A movie" }, { text: "A walk in the park", correct: true }, { text: "A cooking class" }], funFact: "They walked in the park and talked for hours!" },
          { question: "What do Ben & Lou love doing together?", answers: [{ text: "Travel", correct: true }, { text: "Watch sports" }, { text: "Play video games" }, { text: "Go shopping" }], funFact: "They've already visited 10 countries together!" },
          { question: "What pet do Ben and Lou have?", answers: [{ text: "A cat named Whiskers" }, { text: "A dog named Max", correct: true }, { text: "A hamster named Peanut" }, { text: "No pets (yet!)" }], funFact: "Max is a golden retriever who loves belly rubs!" },
          { question: "How did Ben propose to Lou?", answers: [{ text: "At a restaurant" }, { text: "On a beach at sunset", correct: true }, { text: "At a sports game" }, { text: "In a hot air balloon" }], funFact: "Lou said yes before Ben even finished asking!" },
        ],
      },
    };
    this.battleManager.loadTrivia(trivia);
  }

  update() {
    this.inputManager.update();

    if (this.questLog.isVisible) {
      if (this.inputManager.isActionJustPressed() || this.inputManager.isCancelJustPressed()) {
        this.questLog.hide();
      }
      return;
    }

    if (this.dialogueManager.isActive) {
      if (this.inputManager.isActionJustPressed()) {
        this.dialogueManager.advance();
      }
      const move = this.inputManager.getMovement();
      if (move.up) this.dialogueManager.moveChoiceSelection(-1);
      if (move.down) this.dialogueManager.moveChoiceSelection(1);
      return;
    }

    // Player movement
    this.player.update(this.inputManager);

    // Interaction check
    if (this.inputManager.isActionJustPressed() && !this.player.isMoving()) {
      this.tryInteract();
    }
  }

  tryInteract() {
    const facing = this.player.getFacingTile();

    // Check NPCs
    for (const npc of this.npcs) {
      const npcTile = npc.getTilePos();
      if (npcTile.x === facing.x && npcTile.y === facing.y) {
        npc.facePlayer(this.player.getDirection());
        this.dialogueManager.startDialogue(npc.dialogueId, () => {
          // Dialogue ended
        });
        return;
      }
    }

    // Check interactables
    for (const obj of this.interactables) {
      if (!obj.active) continue;
      if (obj.tileX === facing.x && obj.tileY === facing.y) {
        // Quest item check - only interact if quest is active (or static)
        if (!obj.isStatic && obj.questId && !this.questManager.isQuestActive(obj.questId)) {
          continue;
        }

        this.dialogueManager.startDialogue(obj.dialogueId, () => {
          // Remove quest items after pickup
          if (!obj.isStatic) {
            obj.active = false;
            if (obj.sprite) obj.sprite.setVisible(false);
            if (obj.sparkle) obj.sparkle.setVisible(false);
          }
        });
        return;
      }
    }

    // Check collidable objects for descriptions
    const tileX = facing.x;
    const tileY = facing.y;
    if (tileX >= 0 && tileX < GAME_CONFIG.MAP_WIDTH && tileY >= 0 && tileY < GAME_CONFIG.MAP_HEIGHT) {
      const objTile = this.collisionData[tileY][tileX];
      if (objTile === 19) { // cake
        this.dialogueManager.startDialogue('cake-interact', () => {});
      } else if (objTile === 23) { // fountain
        this.dialogueManager.startDialogue('fountain-interact', () => {});
      } else if (objTile === 21) { // sign
        this.dialogueManager.startDialogue('sign-interact', () => {});
      } else if (objTile === 31) { // guestbook
        this.dialogueManager.startDialogue('guestbook-interact', () => {});
      }
    }
  }

  updateNPCIndicators() {
    this.npcs.forEach(npc => {
      const indicator = this.questManager.getNPCIndicator(npc.npcId);
      if (indicator) {
        npc.showQuestIndicator(indicator);
      } else {
        npc.hideQuestIndicator();
      }
    });
  }

  startBattle(triviaSetId) {
    this.scene.pause();
    this.scene.launch('BattleScene', {
      triviaSetId,
      battleManager: this.battleManager,
    });
  }

  onBattleComplete(results) {
    // Mark quest complete if passed
    if (results.rating !== 'fail') {
      this.questManager.advanceStep('bestman-quiz', 'complete-trivia');
    }
  }

  openGuestbook() {
    this.scene.pause();
    this.scene.launch('GuestbookScene');
  }

  onAllQuestsComplete() {
    this.dialogueManager.startDialogue('finale-dialogue', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.on('camerafadeoutcomplete', () => {
        this.scene.start('CreditsScene');
      });
    });

    // Add a finale dialogue if it doesn't exist
    if (!this.dialogueManager.dialogues['finale-dialogue']) {
      this.dialogueManager.dialogues['finale-dialogue'] = {
        nodes: [
          { id: 'start', speaker: '', text: 'You\'ve helped make this wedding absolutely perfect!', next: 'n2' },
          { id: 'n2', speaker: '', text: 'The bouquet is found, the rings are safe, the quiz is aced, and Grandma is happy.', next: 'n3' },
          { id: 'n3', speaker: '', text: 'Thank you for being part of Ben & Lou\'s special day!', next: null },
        ],
      };
    }
  }

  saveGame() {
    const collectedItems = this.interactables
      .filter(o => !o.isStatic && !o.active)
      .map(o => o.id);

    SaveManager.save({
      playerX: this.player.x,
      playerY: this.player.y,
      ...this.questManager.getState(),
      collectedItems,
    });
  }
}
