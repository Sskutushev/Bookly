// src/shared/lib/telegram-storage.ts

import { tg } from './telegram-app';

export const set = (key: string, value: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (tg && tg.CloudStorage) {
      tg.CloudStorage.setItem(key, value, (error: string | null) => {
        if (error) {
          console.error('Error saving to Telegram CloudStorage:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      // Fallback to localStorage
      try {
        localStorage.setItem(key, value);
        resolve();
      } catch (e) {
        console.error('Error saving to localStorage:', e);
        reject(e);
      }
    }
  });
};

export const get = (key: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    if (tg && tg.CloudStorage) {
      tg.CloudStorage.getItem(key, (error: string | null, value?: string) => {
        if (error) {
          console.error('Error getting from Telegram CloudStorage:', error);
          reject(error);
        } else {
          resolve(value || null);
        }
      });
    } else {
      // Fallback to localStorage
      try {
        const value = localStorage.getItem(key);
        resolve(value);
      } catch (e) {
        console.error('Error getting from localStorage:', e);
        reject(e);
      }
    }
  });
};

export const remove = (key: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (tg && tg.CloudStorage) {
      tg.CloudStorage.removeItem(key, (error: string | null) => {
        if (error) {
          console.error('Error removing from Telegram CloudStorage:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      // Fallback to localStorage
      try {
        localStorage.removeItem(key);
        resolve();
      } catch (e) {
        console.error('Error removing from localStorage:', e);
        reject(e);
      }
    }
  });
};

export const getKeys = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (tg && tg.CloudStorage) {
      tg.CloudStorage.getKeys((error: string | null, keys?: string[]) => {
        if (error) {
          console.error('Error getting keys from Telegram CloudStorage:', error);
          reject(error);
        } else {
          resolve(keys || []);
        }
      });
    } else {
      // Fallback to localStorage
      try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            keys.push(key);
          }
        }
        resolve(keys);
      } catch (e) {
        console.error('Error getting keys from localStorage:', e);
        reject(e);
      }
    }
  });
};