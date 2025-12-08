// frontend/src/shared/lib/telegram-app.ts

// Define TypeScript types for Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: BackButton;
  MainButton: MainButton;
  SettingsButton: SettingsButton;
  HapticFeedback: HapticFeedback;
  CloudStorage: CloudStorage;
  BiometricManager?: BiometricManager;
  onEvent(eventType: string, callback: Function): void;
  offEvent(eventType: string, callback: Function): void;
  ready(): void;
  expand(): void;
  close(): void;
  showAlert(message: string): Promise<void>;
  showConfirm(message: string): Promise<boolean>;
  showPopup(params: PopupParams): Promise<number | void>;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback: (status: string) => void): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subsection_bg_color?: string;
  destructive_text_color?: string;
}

interface BackButton {
  isVisible: boolean;
  onClick(callback: Function): void;
  offClick(callback: Function): void;
  show(): void;
  hide(): void;
}

interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): void;
  onClick(callback: Function): void;
  offClick(callback: Function): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive: boolean): void;
  hideProgress(): void;
  setParams(params: any): void;
}

interface SettingsButton {
  isVisible: boolean;
  onClick(callback: Function): void;
  offClick(callback: Function): void;
  show(): void;
  hide(): void;
}

interface HapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

interface CloudStorage {
  getItem(key: string): Promise<string | null>;
  getItems(keys: string[]): Promise<Record<string, string>>;
  setItem(key: string, value: string): Promise<void>;
  setItems(items: Record<string, string>): Promise<void>;
  removeItem(key: string): Promise<void>;
  removeItems(keys: string[]): Promise<void>;
  getKeys(): Promise<string[]>;
}

interface BiometricManager {
  isBiometricAvailable(): Promise<boolean>;
  isBiometricTokenSaved(): Promise<boolean>;
  authenticate(params: { reason: string }): Promise<boolean>;
  enrollBiometric(params: { reason: string }): Promise<void>;
  destroyBiometricToken(): Promise<void>;
}

interface PopupParams {
  title?: string;
  message: string;
  buttons?: PopupButton[];
}

interface PopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text?: string;
}

// frontend/src/shared/lib/telegram-app.ts

// Define TypeScript types for Telegram WebApp
declare global {
    interface Window {
        Telegram: {
            WebApp: TelegramWebApp;
        };
    }
}

// ... (keep the existing interface definitions)

let tg: TelegramWebApp | null = null;

const applyTheme = () => {
    if (tg?.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#0F0F1E';
    } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#F8F9FE';
    }
};

export const initTelegramApp = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        tg = window.Telegram.WebApp;

        tg.ready();
        tg.expand();

        // Apply theme on initial load
        applyTheme();

        // Listen for theme changes
        tg.onEvent('themeChanged', applyTheme);

        return {
            user: tg.initDataUnsafe?.user || null,
            startParam: tg.initDataUnsafe?.start_param || null,
            colorScheme: tg.colorScheme,
            platform: tg.platform,
        };
    } else {
        // Fallback for non-telegram environments - but still initialize basic settings
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#F8F9FE';
        return {
            user: null,
            startParam: null,
            colorScheme: 'light',
            platform: 'unknown',
        };
    }
};

// Export the tg object for direct access
export const tgInstance = () => tg;