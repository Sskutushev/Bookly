// src/shared/lib/telegram-dialogs.ts

import { tg } from './telegram-app';

export const alert = (message: string): Promise<void> => {
  return new Promise((resolve) => {
    if (tg) {
      tg.showAlert(message, () => resolve());
    } else {
      alert(message); // Fallback to browser alert
      resolve();
    }
  });
};

export const confirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (tg) {
      tg.showConfirm(message, (result) => resolve(result));
    } else {
      // Fallback to browser confirm
      resolve(confirm(message));
    }
  });
};

export const popup = (params: {
  title: string;
  message: string;
  buttons: Array<{ id: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }>;
}): Promise<string> => {
  return new Promise((resolve) => {
    if (tg) {
      tg.showPopup(params, (button_id) => resolve(button_id));
    } else {
      // Fallback to browser alert
      alert(params.message);
      resolve('ok');
    }
  });
};