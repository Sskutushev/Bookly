// src/shared/lib/telegram-storage.ts

import { tg } from './telegram-app';

export const set = (key: string, value: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (tg?.CloudStorage) {
      tg.CloudStorage.setItem(key, value, (error) => {
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
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        reject(error);
      }
    }
  });
};

export const get = (key: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    if (tg?.CloudStorage) {
      tg.CloudStorage.getItem(key, (error, value) => {
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
      } catch (error) {
        console.error('Error getting from localStorage:', error);
        reject(error);
      }
    }
  });
};

export const remove = (key: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (tg?.CloudStorage) {
      tg.CloudStorage.removeItem(key, (error) => {
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
      } catch (error) {
        console.error('Error removing from localStorage:', error);
        reject(error);
      }
    }
  });
};

export const getKeys = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (tg?.CloudStorage) {
      tg.CloudStorage.getKeys((error, keys) => {
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
          keys.push(localStorage.key(i) || '');
        }
        resolve(keys);
      } catch (error) {
        console.error('Error getting keys from localStorage:', error);
        reject(error);
      }
    }
  });
};