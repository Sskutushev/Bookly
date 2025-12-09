// src/shared/lib/telegram-main-button.ts

import { tg } from './telegram-app';

class TelegramMainButton {
  private isVisible: boolean = false;
  private isEnabled: boolean = true;
  private isProgressVisible: boolean = false;

  show(text: string, onClick: () => void): void {
    if (!tg) return;
    
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
    
    this.isVisible = true;
  }

  hide(): void {
    if (!tg) return;
    
    tg.MainButton.hide();
    tg.MainButton.offClick(() => {}); // Remove any existing click handlers
    
    this.isVisible = false;
  }

  showProgress(leaveActive: boolean = false): void {
    if (!tg) return;
    
    tg.MainButton.showProgress(leaveActive);
    this.isProgressVisible = true;
  }

  hideProgress(): void {
    if (!tg) return;
    
    tg.MainButton.hideProgress();
    this.isProgressVisible = false;
  }

  enable(): void {
    if (!tg) return;
    
    tg.MainButton.enable();
    this.isEnabled = true;
  }

  disable(): void {
    if (!tg) return;
    
    tg.MainButton.disable();
    this.isEnabled = false;
  }

  updateText(text: string): void {
    if (!tg) return;
    
    tg.MainButton.setText(text);
  }
}

export default new TelegramMainButton();