import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tg } from '../lib/telegram-app';

const TelegramSettingsButton: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!tg) return;

    const handleSettingsButton = () => {
      navigate('/profile');
    };

    tg.SettingsButton.show();
    tg.SettingsButton.onClick(handleSettingsButton);

    return () => {
      tg.SettingsButton.offClick(handleSettingsButton);
    };
  }, [navigate]);

  return null;
};

export default TelegramSettingsButton;