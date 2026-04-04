// Game configuration constants
const GAME_CONFIG = {
  WIDTH: 256,
  HEIGHT: 224,
  TILE_SIZE: 16,
  PLAYER_SPEED: 80,
  STEP_DURATION: 200, // ms per grid step
  TYPEWRITER_SPEED: 30, // ms per character
  ZOOM: 1,

  // Colors
  COLORS: {
    WHITE: 0xffffff,
    BLACK: 0x000000,
    DARK: 0x1a1a2e,
    DIALOGUE_BG: 0x1a1a3e,
    DIALOGUE_BORDER: 0xc8b060,
    BATTLE_BG: 0x2a2a4e,
    CORRECT: 0x40c040,
    INCORRECT: 0xc04040,
    HIGHLIGHT: 0xf8d848,
    QUEST_ACTIVE: 0xf8d848,
    QUEST_COMPLETE: 0x40c040,
    TEXT: 0xf8f8f8,
    TEXT_DIM: 0xa0a0a0,
  },

  // Directions
  DIR: {
    DOWN: 0,
    LEFT: 1,
    RIGHT: 2,
    UP: 3,
  },

  // Map dimensions (in tiles) - will be used for procedural map
  MAP_WIDTH: 30,
  MAP_HEIGHT: 25,

  // Save key
  SAVE_KEY: 'ben-lou-wedding-rpg',
};
