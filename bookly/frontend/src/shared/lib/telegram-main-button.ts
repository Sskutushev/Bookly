// frontend/src/shared/lib/telegram-main-button.ts

import { tg } from './telegram-app';

export class TelegramMainButton {
  show(text: string, onClick: () => void) {
    if (tg && tg.MainButton) {
      tg.MainButton.setText(text);
      tg.MainButton.show();
      tg.MainButton.onClick(onClick);

      // Haptic feedback when button is shown
      if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
      }
    } else {
      console.warn('Telegram MainButton is not available');
    }
  }

  hide() {
    if (tg && tg.MainButton) {
      tg.MainButton.hide();
      tg.MainButton.offClick();
    } else {
      console.warn('Telegram MainButton is not available');
    }
  }

  showProgress() {
    if (tg && tg.MainButton) {
      tg.MainButton.showProgress();
    } else {
      console.warn('Telegram MainButton is not available');
    }
  }

  hideProgress() {
    if (tg && tg.MainButton) {
      tg.MainButton.hideProgress();
    } else {
      console.warn('Telegram MainButton is not available');
    }
  }

  disable() {
    if (tg && tg.MainButton) {
      tg.MainButton.disable();
    } else {
      console.warn('Telegram MainButton is not available');
    }
  }

  enable() {
    if (tg && tg.MainButton) {
      tg.MainButton.enable();
    } else {
      console.warn('Telegram MainButton is not available');
    }
  }
}

export const mainButton = new TelegramMainButton();