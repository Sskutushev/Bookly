// src/shared/lib/telegram-app.ts

// A more complete and accurate set of types for the Telegram WebApp API
declare global {
  interface Window {
    Telegram: {
      WebApp: IWebApp;
    };
  }
}

interface IWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface IWebAppInitData {
    query_id?: string;
    user?: IWebAppUser;
    receiver?: IWebAppUser;
    chat?: object; // Replace with a more specific type if needed
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
}

interface IWebApp {
  initData: string;
  initDataUnsafe: IWebAppInitData;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  
  BackButton: {
    isVisible: boolean;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    show(): void;
    hide(): void;
  };
  
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    setText(text: string): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
  };

  SettingsButton: {
    isVisible: boolean;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
    show(): void;
    hide(): void;
  };

  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };

  CloudStorage: {
      setItem(key: string, value: string, callback?: (error: string | null) => void): void;
      getItem(key: string, callback: (error: string | null, value: string) => void): void;
      getItems(keys: string[], callback: (error: string | null, values: Record<string, string>) => void): void;
      removeItem(key: string, callback?: (error: string | null) => void): void;
      removeItems(keys: string[], callback?: (error: string | null) => void): void;
      getKeys(callback: (error: string | null, keys: string[]) => void): void;
  };

  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: 'bg_color' | 'secondary_bg_color' | string): void;
  setBackgroundColor(color: 'bg_color' | 'secondary_bg_color' | string): void;
  enableClosingConfirmation(): void;
  ready(): void;
  expand(): void;
  close(): void;

  onEvent(eventType: 'themeChanged' | 'viewportChanged', callback: () => void): void;
  offEvent(eventType: 'themeChanged' | 'viewportChanged', callback: () => void): void;
  
  showPopup(params: object, callback?: (id?: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (ok: boolean) => void): void;
}

export const tg = window.Telegram?.WebApp;

function isVersionAtLeast(version: string): boolean {
    if (!tg) return false;
    const parts = tg.version.split('.');
    const required = version.split('.');
    for (let i = 0; i < required.length; i++) {
        const a = parseInt(parts[i] || '0', 10);
        const b = parseInt(required[i] || '0', 10);
        if (a > b) return true;
        if (a < b) return false;
    }
    return true;
}

// Initialize Telegram app
export const initTelegramApp = () => {
  if (!tg) {
    console.warn('Telegram WebApp is not available');
    return null;
  }

  tg.ready();
  tg.expand();

  // Set header and background colors safely
  if (isVersionAtLeast('6.1')) {
    tg.setHeaderColor('#8B7FF5');
    tg.setBackgroundColor(tg.colorScheme === 'dark' ? '#0F0F1E' : '#F8F9FE');
  }

  // Listen to theme changes
  tg.onEvent('themeChanged', () => {
    const isDark = tg.colorScheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    if (isVersionAtLeast('6.1')) {
       tg.setBackgroundColor(isDark ? '#0F0F1E' : '#F8F9FE');
    }
  });

  // Listen to viewport changes
  tg.onEvent('viewportChanged', () => {
    document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportStableHeight}px`);
  });

  return {
    user: tg.initDataUnsafe?.user || null,
    startParam: tg.initDataUnsafe?.start_param || null,
    colorScheme: tg.colorScheme,
    platform: tg.platform,
    isVersionAtLeast: isVersionAtLeast
  };
};