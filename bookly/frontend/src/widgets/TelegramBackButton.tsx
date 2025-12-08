// frontend/src/widgets/TelegramBackButton.tsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { hapticFeedback } from '../shared/lib/telegram-haptic';

const tg = window.Telegram?.WebApp;

export const TelegramBackButton = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if BackButton is supported
    if (!tg?.BackButton) {
      console.warn('Telegram BackButton is not supported in this version');
      return;
    }

    // Show/hide back button based on route
    if (location.pathname === '/') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }

    // Set up back button handler
    const handleBackButton = () => {
      hapticFeedback.light();
      window.history.back();
    };

    tg.BackButton.onClick(handleBackButton);

    // Cleanup
    return () => {
      tg.BackButton.offClick(handleBackButton);
    };
  }, [location]);

  return null; // This component doesn't render anything
};