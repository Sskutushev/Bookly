import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tg } from '@/shared/lib/telegram-app';

const TelegramBackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!tg || !tg.isVersionAtLeast('6.1')) return;

    const handleBackButton = () => {
      navigate(-1);
    };

    if (location.pathname !== '/') {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBackButton);
    } else {
      tg.BackButton.hide();
    }

    return () => {
      if (tg && tg.isVersionAtLeast('6.1')) {
        tg.BackButton.offClick(handleBackButton);
        tg.BackButton.hide();
      }
    };
  }, [location.pathname, navigate]);

  return null;
};

export default TelegramBackButton;