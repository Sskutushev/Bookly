// src/shared/lib/telegram-dialogs.ts

import { tg } from './telegram-app';

export const alert = (message: string): Promise<void> => {
  return new Promise((resolve) => {
    if (tg && tg.showAlert) {
      tg.showAlert(message, resolve);
    } else {
      window.alert(message); // Fallback to browser alert
      resolve();
    }
  });
};

export const confirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (tg && tg.showConfirm) {
      tg.showConfirm(message, (ok: boolean) => resolve(ok));
    } else {
      // Fallback to browser confirm
      resolve(window.confirm(message));
    }
  });
};

type PopupButton = {
  id: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text: string;
};

export const popup = (params: {
  title: string;
  message: string;
  buttons: PopupButton[];
}): Promise<string | undefined> => {
  return new Promise((resolve) => {
    if (tg && tg.showPopup) {
      tg.showPopup(params, (button_id?: string) => resolve(button_id));
    } else {
      // Fallback to browser alert
      window.alert(`${params.title}\n\n${params.message}`);
      resolve(params.buttons.find(b => b.type === 'ok' || b.type === 'default')?.id);
    }
  });
};