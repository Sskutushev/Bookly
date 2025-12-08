import React, { createContext, useContext } from 'react';

interface TelegramContextType {
  tg: any;
  user: any;
  theme: string;
  platform: string;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // tg object is available globally after Telegram WebApp script loads
  const tg = (window as any).Telegram?.WebApp;
  
  // Get user data from init data
  const initData = (window as any).Telegram?.WebApp.initDataUnsafe;
  const user = initData?.user || null;
  
  // Determine current theme
  const theme = tg?.themeParams?.bg_color === '#0f0f1e' ? 'dark' : 'light';
  
  // Platform
  const platform = tg?.platform || 'unknown';

  const value = {
    tg,
    user,
    theme,
    platform,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};