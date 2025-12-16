// frontend/src/shared/lib\telegram-dialogs.ts

import { tg } from './telegram-app';

export const telegramDialogs = {
  // Простой алерт
  alert: (message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!tg) {
        console.warn('Telegram WebApp is not available');
        resolve();
        return;
      }
      tg.showAlert(message, () => resolve());
    });
  },

  // Подтверждение
  confirm: (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!tg) {
        console.warn('Telegram WebApp is not available');
        resolve(false);
        return;
      }
      tg.showConfirm(message, (confirmed) => resolve(!!confirmed));
    });
  },

  // Кастомный popup с кнопками
  popup: (params: {
    title: string;
    message: string;
    buttons: Array<{
      id: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }): Promise<string> => {
    return new Promise((resolve) => {
      if (!tg) {
        console.warn('Telegram WebApp is not available');
        resolve('');
        return;
      }
      
      const telegramParams = {
        title: params.title,
        message: params.message,
        buttons: params.buttons
      };
      
      tg.showPopup(telegramParams, (buttonId) => {
        resolve(buttonId || '');
      });
    });
  },
};