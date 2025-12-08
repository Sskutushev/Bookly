// frontend/src/shared/lib/telegram-storage.ts

export const telegramStorage = {
  async set(key: string, value: string): Promise<void> {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.CloudStorage) {
      return tg.CloudStorage.setItem(key, value);
    } else {
      // Fallback to localStorage
      localStorage.setItem(key, value);
    }
  },

  async get(key: string): Promise<string | null> {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.CloudStorage) {
      return tg.CloudStorage.getItem(key);
    } else {
      // Fallback to localStorage
      return localStorage.getItem(key);
    }
  },

  async remove(key: string): Promise<void> {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.CloudStorage) {
      return tg.CloudStorage.removeItem(key);
    } else {
      // Fallback to localStorage
      localStorage.removeItem(key);
    }
  },

  async getKeys(): Promise<string[]> {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.CloudStorage) {
      return tg.CloudStorage.getKeys();
    } else {
      // Fallback to localStorage
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i)!);
      }
      return keys;
    }
  }
};