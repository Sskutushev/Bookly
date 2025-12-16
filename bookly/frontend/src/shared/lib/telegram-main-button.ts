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

  setColor(color: string) {
    if (!this.button) {
      console.warn('Telegram MainButton is not available');
      return;
    }

    // In Telegram WebApp SDK, colors are set via separate properties
    this.button.color = color;
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
}

export const mainButton = new TelegramMainButton();