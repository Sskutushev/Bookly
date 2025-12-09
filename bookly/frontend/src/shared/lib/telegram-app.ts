// src/shared/lib/telegram-app.ts

// More complete types for Telegram WebApp
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

interface IWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: IWebAppUser;
    // ... other fields
  };
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
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: 'bg_color' | 'secondary_bg_color' | string): void;
  setBackgroundColor(color: 'bg_color' | 'secondary_bg_color' | string): void;
  ready(): void;
  expand(): void;
  // ... other methods
}

export const tg = window.Telegram?.WebApp;

function isVersionAtLeast(version: string) {
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
  }
   if (isVersionAtLeast('6.1')) {
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