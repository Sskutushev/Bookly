// frontend/src/shared/lib/telegram-haptic.ts

const tg = window.Telegram?.WebApp;

export const hapticFeedback = {
  light: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    } else {
      console.warn('Telegram HapticFeedback is not supported in this version');
    }
  },

  medium: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    } else {
      console.warn('Telegram HapticFeedback is not supported in this version');
    }
  },

  heavy: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('heavy');
    } else {
      console.warn('Telegram HapticFeedback is not supported in this version');
    }
  },

  success: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    } else {
      console.warn('Telegram HapticFeedback is not supported in this version');
    }
  },

  warning: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('warning');
    } else {
      console.warn('Telegram HapticFeedback is not supported in this version');
    }
  },

  error: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('error');
    } else {
      console.warn('Telegram HapticFeedback is not supported in this version');
    }
  },

  selection: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    } else {
      console.warn('Telegram HapticFeedback is not supported in this version');
    }
  }
};