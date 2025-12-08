// frontend/src/widgets/TelegramSettingsButton.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hapticFeedback } from '../shared/lib/telegram-haptic';

const tg = window.Telegram?.WebApp;

export const TelegramSettingsButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if SettingsButton is supported
    if (!tg?.SettingsButton) {
      console.warn('Telegram SettingsButton is not supported in this version');
      return;
    }

    // Set up settings button
    const handleSettingsButton = () => {
      hapticFeedback.light();
      navigate('/profile');
    };

    tg.SettingsButton.onClick(handleSettingsButton);

    // Cleanup
    return () => {
      tg.SettingsButton.offClick(handleSettingsButton);
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};