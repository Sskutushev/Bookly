// frontend/src/shared/lib/haptic.ts

import { tg } from './telegram-app';

export const haptic = {
  // Легкая вибрация (при навигации)
  light: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  },

  // Средняя вибрация (при взаимодействии)
  medium: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
  },

  // Сильная вибрация (при важных действиях)
  heavy: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('heavy');
    }
  },

  // Успешное действие
  success: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  },

  // Предупреждение
  warning: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('warning');
    }
  },

  // Ошибка
  error: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('error');
    }
  },

  // Выбор (при нажатии на элемент)
  selection: () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  },
};