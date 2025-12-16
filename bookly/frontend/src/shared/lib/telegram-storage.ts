// frontend/src/shared/lib\telegram-storage.ts

import { tg } from './telegram-app';

export const telegramStorage = {
  // Сохранить данные
  async set(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) {
        reject(new Error('Telegram CloudStorage is not available'));
        return;
      }
      
      tg.CloudStorage.setItem(key, JSON.stringify(value), (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  },

  // Получить данные
  async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) {
        reject(new Error('Telegram CloudStorage is not available'));
        return;
      }
      
      tg.CloudStorage.getItem(key, (error, value) => {
        if (error) reject(error);
        else resolve(value ? JSON.parse(value) : null);
      });
    });
  },

  // Удалить данные
  async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) {
        reject(new Error('Telegram CloudStorage is not available'));
        return;
      }
      
      tg.CloudStorage.removeItem(key, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  },

  // Получить все ключи
  async getKeys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) {
        reject(new Error('Telegram CloudStorage is not available'));
        return;
      }
      
      tg.CloudStorage.getKeys((error, keys) => {
        if (error) reject(error);
        else resolve(keys || []);
      });
    });
  },
};