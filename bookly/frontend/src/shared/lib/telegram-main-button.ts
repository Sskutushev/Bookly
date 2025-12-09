// src/shared/lib/telegram-main-button.ts

import { tg } from './telegram-app';

class TelegramMainButton {
  show(text: string, onClick: () => void): void {
    if (!tg) return;
    
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
  }

  hide(): void {
    if (!tg) return;
    
    tg.MainButton.hide();
    // A generic offClick is needed to remove the listener
    tg.MainButton.offClick(() => {}); 
  }

  showProgress(leaveActive: boolean = false): void {
    if (!tg) return;
    
    tg.MainButton.showProgress(leaveActive);
  }

  hideProgress(): void {
    if (!tg) return;
    
    tg.MainButton.hideProgress();
  }

  enable(): void {
    if (!tg) return;
    
    tg.MainButton.enable();
  }

  disable(): void {
    if (!tg) return;
    
    tg.MainButton.disable();
  }

  updateText(text: string): void {
    if (!tg) return;
    
    tg.MainButton.setText(text);
  }
}

export default new TelegramMainButton();