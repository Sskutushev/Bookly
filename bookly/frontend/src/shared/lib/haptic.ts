// frontend/src/shared/lib/haptic.ts

export const haptic = {
  light() {
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred('light');
  },

  medium() {
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred('medium');
  },

  heavy() {
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred('heavy');
  },

  success() {
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.notificationOccurred('success');
  },

  warning() {
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.notificationOccurred('warning');
  },

  error() {
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.notificationOccurred('error');
  },

  selection() {
    const tg = (window as any).Telegram?.WebApp;
    tg?.HapticFeedback?.selectionChanged();
  }
};