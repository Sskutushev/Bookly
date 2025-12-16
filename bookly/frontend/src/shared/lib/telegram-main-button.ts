// frontend/src/shared/lib/telegram-main-button.ts

import { tg } from './telegram-app';

export class TelegramMainButton {
  show(text: string, onClick: () => void) {
    if (!tg?.MainButton) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);

    // Haptic feedback when button is shown
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
  }

  hide() {
    if (!tg?.MainButton) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    tg.MainButton.hide();
    tg.MainButton.offClick();
  }

  showProgress() {
    if (!tg?.MainButton) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    tg.MainButton.showProgress();
  }

  hideProgress() {
    if (!tg?.MainButton) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    tg.MainButton.hideProgress();
  }

  disable() {
    if (!tg?.MainButton) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    tg.MainButton.disable();
  }

  enable() {
    if (!tg?.MainButton) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    tg.MainButton.enable();
  }
}

export const mainButton = new TelegramMainButton();