// src/shared/lib/haptic.ts

import { tg } from './telegram-app';

const haptic = {
  light(): void {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  },

  medium(): void {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
  },

  heavy(): void {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('heavy');
    }
  },

  success(): void {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  },

  warning(): void {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('warning');
    }
  },

  error(): void {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('error');
    }
  },

  selection(): void {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  },
};

export default haptic;