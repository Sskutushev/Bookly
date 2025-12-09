import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tg } from '../lib/telegram-app';

const TelegramBackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!tg) return;

    const handleBackButton = () => {
      navigate(-1);
    };

    // Show back button on all pages except home
    if (location.pathname !== '/') {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBackButton);
    } else {
      tg.BackButton.hide();
    }

    return () => {
      tg.BackButton.offClick(handleBackButton);
      tg.BackButton.hide();
    };
  }, [location.pathname, navigate]);

  return null;
};

export default TelegramBackButton;