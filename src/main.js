// Main game entry point
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'game-container',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    OverworldScene,
    BattleScene,
    GuestbookScene,
    CreditsScene,
    PokedexScene,
    TrainerCardScene,
  ],
  backgroundColor: GAME_CONFIG.COLORS.DARK,
});
