// frontend/src/shared/lib/telegram-dialogs.ts

const tg = window.Telegram?.WebApp;

interface PopupButton {
  id: string;
  text: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
}

interface PopupParams {
  title?: string;
  message: string;
  buttons: PopupButton[];
}

export const showPopup = (params: PopupParams): Promise<string | undefined> => {
  return new Promise((resolve) => {
    if (tg?.showPopup) {
      tg.showPopup({
        title: params.title,
        message: params.message,
        buttons: params.buttons
      }, (buttonId) => {
        resolve(buttonId);
      });
    } else {
      // Fallback for non-Telegram environments
      if (params.buttons.length === 1) {
        const result = window.confirm(params.message);
        resolve(result ? params.buttons[0].id : undefined);
      } else {
        resolve(params.buttons[0].id);
      }
    }
  });
};

export const showAlert = (message: string): Promise<void> => {
  return new Promise((resolve) => {
    if (tg?.showAlert) {
      tg.showAlert(message, () => resolve());
    } else {
      // Fallback for non-Telegram environments
      alert(message);
      resolve();
    }
  });
};

export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (tg?.showConfirm) {
      tg.showConfirm(message, (result) => resolve(result));
    } else {
      // Fallback for non-Telegram environments
      const result = confirm(message);
      resolve(result);
    }
  });
};