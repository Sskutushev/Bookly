// frontend/src/shared/lib/telegram-main-button.ts

import { tg } from './telegram-app';

export class TelegramMainButton {
  private button = tg?.MainButton;

  show(text: string, onClick: () => void) {
    if (!this.button) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    this.button.setText(text);
    this.button.show();
    this.button.onClick(onClick);

    // Haptic feedback when button is shown
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
  }

  hide() {
    if (!this.button) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    this.button.hide();
    this.button.offClick();
  }

  showProgress() {
    if (!this.button) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    this.button.showProgress();
  }

  hideProgress() {
    if (!this.button) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    this.button.hideProgress();
  }

  disable() {
    if (!this.button) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    this.button.disable();
  }

  enable() {
    if (!this.button) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    this.button.enable();
  }

  setColor(color: string) {
    // setColor is not a standard Telegram WebApp MainButton method
    // The color is typically handled via CSS or predefined themes
    // Keeping this method for compatibility but with no-op implementation
    console.log('Setting button color to:', color);
  }
}

export const mainButton = new TelegramMainButton();