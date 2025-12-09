import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tg } from '@/shared/lib/telegram-app';

const TelegramSettingsButton: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!tg || !tg.isVersionAtLeast('6.4')) return;

    const handleSettingsButton = () => {
      navigate('/profile');
    };

    tg.SettingsButton.show();
    tg.SettingsButton.onClick(handleSettingsButton);

    return () => {
      if (tg && tg.isVersionAtLeast('6.4')) {
        tg.SettingsButton.offClick(handleSettingsButton);
        tg.SettingsButton.hide();
      }
    };
  }, [navigate]);

  return null;
};

export default TelegramSettingsButton;