class SaveManager {
  static save(gameState) {
    try {
      const data = {
        version: 1,
        timestamp: new Date().toISOString(),
        ...gameState,
      };
      localStorage.setItem(GAME_CONFIG.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Failed to save:', e);
      return false;
    }
  }

  static load() {
    try {
      const data = localStorage.getItem(GAME_CONFIG.SAVE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load save:', e);
      return null;
    }
  }

  static hasSave() {
    return localStorage.getItem(GAME_CONFIG.SAVE_KEY) !== null;
  }

  static deleteSave() {
    localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
  }
}
