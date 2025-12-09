// src/shared/lib/telegram-app.ts

// Define types for Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  header_bg_color?: string;
  secondary_bg_color?: string;
}

interface TelegramWebApp {
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: ThemeParams;
  initData: string;
  initDataUnsafe: any;
  headerColor: string;
  backgroundColor: string;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  MainButton: MainButton;
  BackButton: BackButton;
  SettingsButton: SettingsButton;
  HapticFeedback: HapticFeedback;
  CloudStorage: CloudStorage;
  onEvent(eventType: string, callback: Function): void;
  offEvent(eventType: string, callback: Function): void;
  ready(): void;
  expand(): void;
  close(): void;
  showPopup(params: any, callback?: Function): void;
  showAlert(message: string, callback?: Function): void;
  showConfirm(message: string, callback?: Function): void;
  showScanQrPopup(params: any, callback?: Function): void;
  closeScanQrPopup(): void;
  openLink(url: string, options?: any): void;
  openInvoice(url: string, callback?: Function): void;
  readTextFromClipboard(callback?: Function): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
}

interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): MainButton;
  onClick(callback: Function): MainButton;
  offClick(callback: Function): MainButton;
  show(): MainButton;
  hide(): MainButton;
  enable(): MainButton;
  disable(): MainButton;
  showProgress(leaveActive: boolean): MainButton;
  hideProgress(): MainButton;
  setParams(params: any): MainButton;
}

interface BackButton {
  isVisible: boolean;
  onClick(callback: Function): BackButton;
  offClick(callback: Function): BackButton;
  show(): BackButton;
  hide(): BackButton;
}

interface SettingsButton {
  isVisible: boolean;
  onClick(callback: Function): SettingsButton;
  offClick(callback: Function): SettingsButton;
  show(): SettingsButton;
  hide(): SettingsButton;
}

interface HapticFeedback {
  impactOccurred(style: string): void;
  notificationOccurred(type: string): void;
  selectionChanged(): void;
}

interface CloudStorage {
  setItem(key: string, value: string, callback?: Function): void;
  getItem(key: string, callback: Function): void;
  getItems(keys: string[], callback: Function): void;
  removeItem(key: string, callback?: Function): void;
  removeItems(keys: string[], callback?: Function): void;
  getKeys(callback: Function): void;
}

// Get the Telegram WebApp instance
export const tg = window.Telegram?.WebApp || null;

// Initialize Telegram app
export const initTelegramApp = () => {
  if (!tg) {
    console.warn('Telegram WebApp is not available');
    return {
      user: null,
      startParam: null,
      colorScheme: 'light',
      platform: 'unknown',
    };
  }

  // Make the app ready
  tg.ready();
  
  // Expand the app to full height
  tg.expand();

  // Set header and background colors based on theme
  tg.setHeaderColor('#8B7FF5');
  tg.setBackgroundColor('#F8F9FE');

  // Listen to theme changes
  tg.onEvent('themeChanged', () => {
    const isDark = tg.colorScheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    
    // Update colors based on theme
    if (isDark) {
      tg.setBackgroundColor('#0F0F1E');
    } else {
      tg.setBackgroundColor('#F8F9FE');
    }
  });

  // Listen to viewport changes
  tg.onEvent('viewportChanged', () => {
    document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportStableHeight}px`);
  });

  // Return useful data
  return {
    user: tg.initDataUnsafe?.user || null,
    startParam: tg.initDataUnsafe?.start_param || null,
    colorScheme: tg.colorScheme,
    platform: tg.platform,
  };
};

// Export other useful Telegram functions
export const showPopup = (params: any, callback?: Function) => {
  if (tg) {
    tg.showPopup(params, callback);
  }
};

export const showAlert = (message: string, callback?: Function) => {
  if (tg) {
    tg.showAlert(message, callback);
  }
};

export const showConfirm = (message: string, callback?: Function) => {
  if (tg) {
    tg.showConfirm(message, callback);
  }
};

export const openLink = (url: string, options?: any) => {
  if (tg) {
    tg.openLink(url, options);
  }
};

export const openInvoice = (url: string, callback?: Function) => {
  if (tg) {
    tg.openInvoice(url, callback);
  }
};

export default tg;