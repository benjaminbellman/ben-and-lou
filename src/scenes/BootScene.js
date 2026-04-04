class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Generate all game assets programmatically (no external files needed)
    this.generateAssets();
  }

  create() {
    this.scene.start('PreloadScene');
  }

  generateAssets() {
    const T = GAME_CONFIG.TILE_SIZE;

    // --- TILESET ---
    this.generateTileset(T);

    // --- CHARACTER SPRITES ---
    this.generateCharacterSprite('player', [0x4488cc, 0x2266aa, 0xffcc88]); // blue outfit
    this.generateCharacterSprite('npc-lou', [0xf0f0f0, 0xd0d0d0, 0xffcc88]); // white dress
    this.generateCharacterSprite('npc-ben', [0x2a2a2a, 0x1a1a1a, 0xffcc88]); // black suit
    this.generateCharacterSprite('npc-bestman', [0x446688, 0x335577, 0xdeb887]); // blue suit
    this.generateCharacterSprite('npc-moh', [0xcc6688, 0xaa4466, 0xffcc88]); // pink dress
    this.generateCharacterSprite('npc-grandma', [0x9988aa, 0x776688, 0xffd8b0]); // purple outfit

    // --- UI ELEMENTS ---
    this.generateDialogueBox();
    this.generateBattleBG();
    this.generateQuestIndicators();
    this.generateInteractableSprites();
    this.generateTitleBG();
  }

  generateTileset(T) {
    const cols = 8;
    const rows = 8;
    const canvas = this.textures.createCanvas('tileset', cols * T, rows * T);
    const ctx = canvas.context;

    const tiles = [
      // Row 0: Ground tiles
      () => this.drawGrass(ctx, 0, 0, T),           // 0: grass
      () => this.drawPath(ctx, T, 0, T),             // 1: stone path
      () => this.drawFloor(ctx, T*2, 0, T),          // 2: wood floor
      () => this.drawFloor2(ctx, T*3, 0, T),         // 3: tile floor
      () => this.drawWater(ctx, T*4, 0, T),          // 4: water/fountain
      () => this.drawCarpet(ctx, T*5, 0, T),         // 5: red carpet
      () => this.drawDirt(ctx, T*6, 0, T),           // 6: dirt
      () => this.drawGrassFlower(ctx, T*7, 0, T),    // 7: grass with flower

      // Row 1: Walls and structures
      () => this.drawWall(ctx, 0, T, T),             // 8: wall
      () => this.drawWallTop(ctx, T, T, T),          // 9: wall top
      () => this.drawFence(ctx, T*2, T, T),          // 10: fence
      () => this.drawTree(ctx, T*3, T, T),           // 11: tree
      () => this.drawBush(ctx, T*4, T, T),           // 12: bush
      () => this.drawColumn(ctx, T*5, T, T),         // 13: column/pillar
      () => this.drawDoor(ctx, T*6, T, T),           // 14: door
      () => this.drawWindow(ctx, T*7, T, T),         // 15: window

      // Row 2: Furniture and objects
      () => this.drawTable(ctx, 0, T*2, T),          // 16: table
      () => this.drawChair(ctx, T, T*2, T),          // 17: chair
      () => this.drawBarrel(ctx, T*2, T*2, T),       // 18: barrel/keg
      () => this.drawCake(ctx, T*3, T*2, T),         // 19: wedding cake
      () => this.drawFlowerPot(ctx, T*4, T*2, T),    // 20: flower pot
      () => this.drawSign(ctx, T*5, T*2, T),         // 21: sign
      () => this.drawBench(ctx, T*6, T*2, T),        // 22: bench
      () => this.drawFountain(ctx, T*7, T*2, T),     // 23: fountain

      // Row 3: Decorations
      () => this.drawArchway(ctx, 0, T*3, T),        // 24: archway
      () => this.drawLantern(ctx, T, T*3, T),        // 25: lantern
      () => this.drawBanner(ctx, T*2, T*3, T),       // 26: banner
      () => this.drawRug(ctx, T*3, T*3, T),          // 27: decorative rug
      () => this.drawCanopy(ctx, T*4, T*3, T),       // 28: canopy/above
      () => this.drawRoof(ctx, T*5, T*3, T),         // 29: roof edge
      () => this.drawStairs(ctx, T*6, T*3, T),       // 30: stairs
      () => this.drawGuestbook(ctx, T*7, T*3, T),    // 31: guestbook stand
    ];

    tiles.forEach(fn => fn());
    canvas.refresh();
  }

  // --- Tile drawing helpers ---
  drawGrass(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#5a9c4f';
    for (let i = 0; i < 6; i++) {
      const gx = x + Math.floor(Math.random() * (T - 2)) + 1;
      const gy = y + Math.floor(Math.random() * (T - 2)) + 1;
      ctx.fillRect(gx, gy, 1, 2);
    }
  }

  drawPath(ctx, x, y, T) {
    ctx.fillStyle = '#b8a878';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#a89868';
    ctx.fillRect(x + 2, y + 2, 3, 3);
    ctx.fillRect(x + 8, y + 7, 4, 3);
    ctx.fillRect(x + 3, y + 11, 3, 2);
  }

  drawFloor(ctx, x, y, T) {
    ctx.fillStyle = '#c8a870';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#b89860';
    ctx.fillRect(x, y, T, 1);
    ctx.fillRect(x, y, 1, T);
    ctx.fillRect(x + T/2, y, 1, T);
    ctx.fillRect(x, y + T/2, T, 1);
  }

  drawFloor2(ctx, x, y, T) {
    ctx.fillStyle = '#d8c8a8';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#c8b898';
    ctx.fillRect(x, y, T, 1);
    ctx.fillRect(x, y, 1, T);
  }

  drawWater(ctx, x, y, T) {
    ctx.fillStyle = '#4488cc';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#66aadd';
    ctx.fillRect(x + 3, y + 4, 5, 1);
    ctx.fillRect(x + 8, y + 9, 4, 1);
  }

  drawCarpet(ctx, x, y, T) {
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#dd4444';
    ctx.fillRect(x + 1, y + 1, T - 2, T - 2);
    ctx.fillStyle = '#eebb33';
    ctx.fillRect(x + 2, y, T - 4, 1);
    ctx.fillRect(x + 2, y + T - 1, T - 4, 1);
  }

  drawDirt(ctx, x, y, T) {
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#9b8365';
    ctx.fillRect(x + 5, y + 3, 2, 2);
    ctx.fillRect(x + 2, y + 10, 3, 2);
  }

  drawGrassFlower(ctx, x, y, T) {
    this.drawGrass(ctx, x, y, T);
    // Add small flowers
    ctx.fillStyle = '#ff88aa';
    ctx.fillRect(x + 4, y + 3, 2, 2);
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(x + 10, y + 10, 2, 2);
    ctx.fillStyle = '#ff88aa';
    ctx.fillRect(x + 11, y + 4, 2, 2);
  }

  drawWall(ctx, x, y, T) {
    ctx.fillStyle = '#886655';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#776655';
    ctx.fillRect(x, y, T, 2);
    ctx.fillRect(x, y + T - 2, T, 2);
    ctx.fillStyle = '#998866';
    ctx.fillRect(x + 2, y + 3, T - 4, T - 6);
  }

  drawWallTop(ctx, x, y, T) {
    ctx.fillStyle = '#998877';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#887766';
    ctx.fillRect(x, y + T - 3, T, 3);
  }

  drawFence(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#c8b090';
    ctx.fillRect(x, y + 4, T, 2);
    ctx.fillRect(x, y + 10, T, 2);
    ctx.fillRect(x + 2, y + 2, 2, 12);
    ctx.fillRect(x + 10, y + 2, 2, 12);
  }

  drawTree(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(x + 6, y + 10, 4, 6);
    ctx.fillStyle = '#2d6b1e';
    ctx.fillRect(x + 2, y + 1, 12, 10);
    ctx.fillStyle = '#3a7c2e';
    ctx.fillRect(x + 4, y + 2, 8, 8);
  }

  drawBush(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#2d6b1e';
    ctx.fillRect(x + 1, y + 5, 14, 10);
    ctx.fillStyle = '#3a7c2e';
    ctx.fillRect(x + 3, y + 4, 10, 8);
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x + 5, y + 6, 6, 4);
  }

  drawColumn(ctx, x, y, T) {
    ctx.fillStyle = '#d8c8a8';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#e8d8b8';
    ctx.fillRect(x + 4, y, 8, T);
    ctx.fillStyle = '#f0e0c0';
    ctx.fillRect(x + 5, y + 1, 6, 2);
    ctx.fillRect(x + 5, y + T - 3, 6, 2);
  }

  drawDoor(ctx, x, y, T) {
    ctx.fillStyle = '#886655';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#664433';
    ctx.fillRect(x + 3, y + 2, 10, 14);
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(x + 10, y + 8, 2, 2);
  }

  drawWindow(ctx, x, y, T) {
    ctx.fillStyle = '#886655';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#88bbdd';
    ctx.fillRect(x + 3, y + 3, 10, 8);
    ctx.fillStyle = '#776655';
    ctx.fillRect(x + 7, y + 3, 2, 8);
    ctx.fillRect(x + 3, y + 6, 10, 2);
  }

  drawTable(ctx, x, y, T) {
    ctx.fillStyle = '#c8a870';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#aa8855';
    ctx.fillRect(x + 1, y + 4, 14, 8);
    ctx.fillStyle = '#996644';
    ctx.fillRect(x + 2, y + 12, 2, 3);
    ctx.fillRect(x + 12, y + 12, 2, 3);
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(x + 2, y + 4, 12, 1);
  }

  drawChair(ctx, x, y, T) {
    ctx.fillStyle = '#c8a870';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#996644';
    ctx.fillRect(x + 4, y + 3, 8, 2);
    ctx.fillRect(x + 4, y + 5, 8, 6);
    ctx.fillRect(x + 5, y + 11, 2, 4);
    ctx.fillRect(x + 9, y + 11, 2, 4);
    ctx.fillStyle = '#884433';
    ctx.fillRect(x + 4, y + 3, 2, 8);
  }

  drawBarrel(ctx, x, y, T) {
    ctx.fillStyle = '#c8a870';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(x + 3, y + 2, 10, 12);
    ctx.fillStyle = '#a07818';
    ctx.fillRect(x + 4, y + 3, 8, 10);
    ctx.fillStyle = '#6b5010';
    ctx.fillRect(x + 3, y + 5, 10, 1);
    ctx.fillRect(x + 3, y + 10, 10, 1);
  }

  drawCake(ctx, x, y, T) {
    ctx.fillStyle = '#c8a870';
    ctx.fillRect(x, y, T, T);
    // 3-tier cake
    ctx.fillStyle = '#f8f0e8';
    ctx.fillRect(x + 2, y + 8, 12, 6);  // bottom tier
    ctx.fillRect(x + 4, y + 4, 8, 5);   // middle tier
    ctx.fillRect(x + 6, y + 1, 4, 4);   // top tier
    ctx.fillStyle = '#ff8888';
    ctx.fillRect(x + 3, y + 8, 10, 1);  // frosting
    ctx.fillRect(x + 5, y + 4, 6, 1);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(x + 7, y + 0, 2, 2);   // topper
  }

  drawFlowerPot(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#cc6633';
    ctx.fillRect(x + 4, y + 8, 8, 7);
    ctx.fillRect(x + 3, y + 8, 10, 2);
    ctx.fillStyle = '#44aa33';
    ctx.fillRect(x + 6, y + 3, 4, 6);
    ctx.fillStyle = '#ff6688';
    ctx.fillRect(x + 5, y + 2, 3, 3);
    ctx.fillStyle = '#ff88aa';
    ctx.fillRect(x + 9, y + 3, 2, 2);
  }

  drawSign(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(x + 7, y + 8, 2, 7);
    ctx.fillStyle = '#c8a870';
    ctx.fillRect(x + 2, y + 2, 12, 7);
    ctx.fillStyle = '#886644';
    ctx.fillRect(x + 2, y + 2, 12, 1);
    ctx.fillRect(x + 2, y + 8, 12, 1);
  }

  drawBench(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#996644';
    ctx.fillRect(x + 1, y + 6, 14, 3);
    ctx.fillRect(x + 1, y + 4, 14, 2);
    ctx.fillRect(x + 2, y + 9, 2, 5);
    ctx.fillRect(x + 12, y + 9, 2, 5);
  }

  drawFountain(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#999999';
    ctx.fillRect(x + 2, y + 6, 12, 9);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(x + 3, y + 7, 10, 7);
    ctx.fillStyle = '#4488cc';
    ctx.fillRect(x + 4, y + 8, 8, 5);
    ctx.fillStyle = '#66aadd';
    ctx.fillRect(x + 6, y + 3, 4, 5);
    ctx.fillRect(x + 7, y + 1, 2, 3);
  }

  drawArchway(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#f0e0c0';
    ctx.fillRect(x + 1, y, 3, T);
    ctx.fillRect(x + 12, y, 3, T);
    ctx.fillRect(x + 1, y, 14, 4);
    ctx.fillStyle = '#ff8888';
    ctx.fillRect(x + 4, y + 1, 2, 2);
    ctx.fillRect(x + 10, y + 1, 2, 2);
    ctx.fillRect(x + 7, y, 2, 2);
  }

  drawLantern(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#888888';
    ctx.fillRect(x + 6, y + 2, 4, 2);
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(x + 5, y + 4, 6, 6);
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(x + 6, y + 5, 4, 4);
    ctx.fillStyle = '#888888';
    ctx.fillRect(x + 6, y + 10, 4, 2);
    ctx.fillRect(x + 7, y + 0, 2, 3);
  }

  drawBanner(ctx, x, y, T) {
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#f8d848';
    ctx.fillRect(x + 1, y + 1, 14, 1);
    ctx.fillStyle = '#ff6688';
    ctx.fillRect(x + 2, y + 2, 4, 6);
    ctx.fillRect(x + 3, y + 8, 2, 2);
    ctx.fillStyle = '#8888ff';
    ctx.fillRect(x + 8, y + 2, 4, 6);
    ctx.fillRect(x + 9, y + 8, 2, 2);
  }

  drawRug(ctx, x, y, T) {
    ctx.fillStyle = '#c8a870';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#cc4444';
    ctx.fillRect(x + 1, y + 1, 14, 14);
    ctx.fillStyle = '#dd6644';
    ctx.fillRect(x + 2, y + 2, 12, 12);
    ctx.fillStyle = '#eebb33';
    ctx.fillRect(x + 5, y + 5, 6, 6);
  }

  drawCanopy(ctx, x, y, T) {
    ctx.fillStyle = '#f0e0c066';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#e0d0b0';
    ctx.fillRect(x, y, T, 3);
    ctx.fillRect(x, y + T - 1, T, 1);
  }

  drawRoof(ctx, x, y, T) {
    ctx.fillStyle = '#885544';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#774433';
    for (let i = 0; i < T; i += 4) {
      ctx.fillRect(x, y + i, T, 1);
    }
  }

  drawStairs(ctx, x, y, T) {
    ctx.fillStyle = '#b8a878';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#a89868';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x, y + i * 4, T, 2);
    }
    ctx.fillStyle = '#c8b888';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x, y + i * 4 + 2, T, 2);
    }
  }

  drawGuestbook(ctx, x, y, T) {
    ctx.fillStyle = '#c8a870';
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = '#996644';
    ctx.fillRect(x + 4, y + 6, 8, 9);
    ctx.fillRect(x + 3, y + 6, 10, 2);
    ctx.fillStyle = '#f8f0e0';
    ctx.fillRect(x + 3, y + 1, 10, 6);
    ctx.fillStyle = '#884422';
    ctx.fillRect(x + 4, y + 2, 8, 4);
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(x + 6, y + 3, 4, 2);
  }

  generateCharacterSprite(key, colors) {
    const W = 16;
    const H = 24;
    const canvas = this.textures.createCanvas(key, W * 4, H * 4);
    const ctx = canvas.context;
    const [body, bodyDark, skin] = colors;

    const bodyHex = '#' + body.toString(16).padStart(6, '0');
    const bodyDarkHex = '#' + bodyDark.toString(16).padStart(6, '0');
    const skinHex = '#' + skin.toString(16).padStart(6, '0');
    const hairHex = '#443322';

    // 4 directions (down, left, right, up) x 4 frames (stand, walk1, stand, walk2)
    for (let dir = 0; dir < 4; dir++) {
      for (let frame = 0; frame < 4; frame++) {
        const ox = frame * W;
        const oy = dir * H;
        this.drawCharFrame(ctx, ox, oy, W, H, dir, frame, bodyHex, bodyDarkHex, skinHex, hairHex);
      }
    }

    canvas.refresh();
  }

  drawCharFrame(ctx, ox, oy, W, H, dir, frame, body, bodyDark, skin, hair) {
    // Walking animation offset
    const walkOffset = (frame === 1) ? -1 : (frame === 3) ? 1 : 0;

    // Head
    ctx.fillStyle = skin;
    ctx.fillRect(ox + 5, oy + 2, 6, 6);

    // Hair
    ctx.fillStyle = hair;
    if (dir === 0) { // facing down
      ctx.fillRect(ox + 4, oy + 1, 8, 3);
      // Eyes
      ctx.fillStyle = '#222222';
      ctx.fillRect(ox + 6, oy + 5, 1, 1);
      ctx.fillRect(ox + 9, oy + 5, 1, 1);
    } else if (dir === 3) { // facing up
      ctx.fillRect(ox + 4, oy + 1, 8, 5);
      ctx.fillStyle = skin;
      ctx.fillRect(ox + 5, oy + 5, 6, 1);
    } else if (dir === 1) { // facing left
      ctx.fillRect(ox + 5, oy + 1, 7, 3);
      ctx.fillStyle = '#222222';
      ctx.fillRect(ox + 6, oy + 5, 1, 1);
    } else { // facing right
      ctx.fillRect(ox + 4, oy + 1, 7, 3);
      ctx.fillStyle = '#222222';
      ctx.fillRect(ox + 9, oy + 5, 1, 1);
    }

    // Body
    ctx.fillStyle = body;
    ctx.fillRect(ox + 4, oy + 8, 8, 8);
    ctx.fillStyle = bodyDark;
    ctx.fillRect(ox + 4, oy + 8, 8, 1);

    // Legs
    const legShift = walkOffset;
    ctx.fillStyle = bodyDark;
    ctx.fillRect(ox + 5 + legShift, oy + 16, 3, 6);
    ctx.fillRect(ox + 8 - legShift, oy + 16, 3, 6);

    // Feet
    ctx.fillStyle = '#443322';
    ctx.fillRect(ox + 5 + legShift, oy + 21, 3, 2);
    ctx.fillRect(ox + 8 - legShift, oy + 21, 3, 2);
  }

  generateDialogueBox() {
    const W = GAME_CONFIG.WIDTH;
    const H = 56;
    const canvas = this.textures.createCanvas('dialogue-box', W, H);
    const ctx = canvas.context;

    // Background
    ctx.fillStyle = '#1a1a3eee';
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = '#c8b060';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, W - 4, H - 4);

    // Inner highlight
    ctx.strokeStyle = '#f8d848';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, W - 8, H - 8);

    canvas.refresh();
  }

  generateBattleBG() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;
    const canvas = this.textures.createCanvas('battle-bg', W, H);
    const ctx = canvas.context;

    // Gradient-like background
    for (let y = 0; y < H; y++) {
      const t = y / H;
      const r = Math.floor(30 + t * 20);
      const g = Math.floor(30 + t * 20);
      const b = Math.floor(60 + t * 30);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, y, W, 1);
    }

    // Decorative stars
    ctx.fillStyle = '#ffffff44';
    for (let i = 0; i < 20; i++) {
      const sx = Math.floor(Math.random() * W);
      const sy = Math.floor(Math.random() * H);
      ctx.fillRect(sx, sy, 1, 1);
    }

    canvas.refresh();
  }

  generateQuestIndicators() {
    // Exclamation mark (new quest)
    const canvas1 = this.textures.createCanvas('quest-exclaim', 8, 8);
    const ctx1 = canvas1.context;
    ctx1.fillStyle = '#f8d848';
    ctx1.fillRect(3, 0, 2, 5);
    ctx1.fillRect(3, 6, 2, 2);
    canvas1.refresh();

    // Question mark (quest ready)
    const canvas2 = this.textures.createCanvas('quest-question', 8, 8);
    const ctx2 = canvas2.context;
    ctx2.fillStyle = '#f8d848';
    ctx2.fillRect(2, 0, 4, 2);
    ctx2.fillRect(4, 2, 2, 2);
    ctx2.fillRect(3, 4, 2, 1);
    ctx2.fillRect(3, 6, 2, 2);
    canvas2.refresh();

    // Check mark (quest complete)
    const canvas3 = this.textures.createCanvas('quest-check', 8, 8);
    const ctx3 = canvas3.context;
    ctx3.fillStyle = '#40c040';
    ctx3.fillRect(1, 4, 2, 2);
    ctx3.fillRect(2, 5, 2, 2);
    ctx3.fillRect(3, 4, 2, 2);
    ctx3.fillRect(4, 3, 2, 2);
    ctx3.fillRect(5, 2, 2, 2);
    ctx3.fillRect(6, 1, 2, 2);
    canvas3.refresh();
  }

  generateInteractableSprites() {
    const T = GAME_CONFIG.TILE_SIZE;

    // Bouquet
    const b = this.textures.createCanvas('item-bouquet', T, T);
    const bctx = b.context;
    bctx.fillStyle = '#44aa33';
    bctx.fillRect(6, 8, 4, 6);
    bctx.fillStyle = '#ff6688';
    bctx.fillRect(3, 2, 4, 4);
    bctx.fillStyle = '#ff88aa';
    bctx.fillRect(7, 1, 4, 4);
    bctx.fillStyle = '#ffaacc';
    bctx.fillRect(5, 4, 4, 3);
    bctx.fillStyle = '#ffffff';
    bctx.fillRect(9, 3, 3, 3);
    b.refresh();

    // Ring
    const r = this.textures.createCanvas('item-ring', T, T);
    const rctx = r.context;
    rctx.fillStyle = '#f8d848';
    rctx.fillRect(4, 5, 8, 7);
    rctx.fillStyle = '#000000';
    rctx.fillRect(6, 7, 4, 3);
    rctx.fillStyle = '#88ccff';
    rctx.fillRect(6, 3, 4, 3);
    r.refresh();

    // Sparkle (for item locations)
    const s = this.textures.createCanvas('sparkle', T, T);
    const sctx = s.context;
    sctx.fillStyle = '#f8d848';
    sctx.fillRect(7, 0, 2, T);
    sctx.fillRect(0, 7, T, 2);
    sctx.fillStyle = '#ffffff';
    sctx.fillRect(7, 6, 2, 4);
    sctx.fillRect(5, 7, 6, 2);
    s.refresh();
  }

  generateTitleBG() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;
    const canvas = this.textures.createCanvas('title-bg', W, H);
    const ctx = canvas.context;

    // Sky gradient
    for (let y = 0; y < H; y++) {
      const t = y / H;
      const r = Math.floor(100 + t * 40);
      const g = Math.floor(140 + t * 30);
      const b = Math.floor(200 - t * 60);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, y, W, 1);
    }

    // Ground
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = '#5a9c4f';
    ctx.fillRect(0, H - 40, W, 3);

    // Simple venue silhouette
    ctx.fillStyle = '#d8c8a8';
    ctx.fillRect(60, H - 80, 136, 45);
    ctx.fillStyle = '#c8b898';
    ctx.fillRect(80, H - 95, 96, 20);
    // Roof
    ctx.fillStyle = '#885544';
    ctx.fillRect(75, H - 98, 106, 6);
    // Door
    ctx.fillStyle = '#664433';
    ctx.fillRect(118, H - 60, 20, 25);
    // Windows
    ctx.fillStyle = '#88bbdd';
    ctx.fillRect(75, H - 68, 12, 10);
    ctx.fillRect(170, H - 68, 12, 10);

    // Hearts
    ctx.fillStyle = '#ff6688';
    this.drawHeart(ctx, 40, 30, 6);
    this.drawHeart(ctx, 200, 45, 4);
    this.drawHeart(ctx, 120, 20, 5);

    canvas.refresh();
  }

  drawHeart(ctx, x, y, size) {
    const s = size;
    ctx.fillRect(x - s, y - s/2, s, s);
    ctx.fillRect(x + 1, y - s/2, s, s);
    ctx.fillRect(x - s/2, y, s * 2 - 1, s);
    ctx.fillRect(x - s/2 + 1, y + s, s * 2 - 3, s/2);
    ctx.fillRect(x, y + s + s/2, 1, 1);
  }
}
