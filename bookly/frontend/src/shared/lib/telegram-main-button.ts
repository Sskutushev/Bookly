// frontend/src/shared/lib/telegram-main-button.ts

const tg = window.Telegram?.WebApp;
let currentCallback: (() => void) | null = null;

export class TelegramMainButton {
  static show(text: string, onClick: () => void) {
    if (tg?.MainButton) {
      // Remove previous listener if exists
      if (currentCallback) {
        tg.MainButton.offClick(currentCallback);
      }

      tg.MainButton.setText(text);
      tg.MainButton.show();
      tg.MainButton.enable();

      // Update callback reference
      currentCallback = onClick;
      tg.MainButton.onClick(currentCallback);
    } else {
      console.warn('Telegram MainButton is not supported in this version');
    }
  }

  static hide() {
    if (tg?.MainButton) {
      if (currentCallback) {
        tg.MainButton.offClick(currentCallback);
        currentCallback = null;
      }
      tg.MainButton.hide();
    } else {
      console.warn('Telegram MainButton is not supported in this version');
    }
  }

  static showProgress(leaveActive: boolean = false) {
    if (tg?.MainButton) {
      tg.MainButton.showProgress(leaveActive);
      if (!leaveActive) {
        tg.MainButton.disable();
      }
    } else {
      console.warn('Telegram MainButton is not supported in this version');
    }
  }

  static hideProgress() {
    if (tg?.MainButton) {
      tg.MainButton.hideProgress();
      tg.MainButton.enable();
    } else {
      console.warn('Telegram MainButton is not supported in this version');
    }
  }

  static enable() {
    if (tg?.MainButton) {
      tg.MainButton.enable();
    } else {
      console.warn('Telegram MainButton is not supported in this version');
    }
  }

  static disable() {
    if (tg?.MainButton) {
      tg.MainButton.disable();
    } else {
      console.warn('Telegram MainButton is not supported in this version');
    }
  }

  static setParams(params: any) {
    if (tg?.MainButton) {
      tg.MainButton.setParams(params);
    } else {
      console.warn('Telegram MainButton is not supported in this version');
    }
  }
}