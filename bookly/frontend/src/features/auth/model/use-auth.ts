// bookly/frontend/src/features/auth/model/use-auth.ts
import { useEffect } from 'react';
import { useAuthStore } from '../../../entities/user/model/use-auth-store';
import { api } from '../../../shared/api';

export const useAuth = () => {
  const { setTokens, setUser, setLoading, accessToken } = useAuthStore();

  useEffect(() => {
    const authenticate = async () => {
      // Only run auth flow if we don't have a token already
      if (accessToken) {
        setLoading(false);
        return;
      }
      
      const tg = window.Telegram?.WebApp;

      if (!tg || !tg.initData) {
        console.error("Telegram Web App data is not available.");
        // Here you might want to handle non-telegram environments or show an error
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const response = await api.post('/auth/telegram', {
          initData: tg.initData,
        });

        const { user, accessToken, refreshToken } = response.data;

        setTokens(accessToken, refreshToken);
        setUser(user);

      } catch (error) {
        console.error("Authentication failed:", error);
        // Handle auth failure, maybe close the app or show an error popup
        if (tg?.close) {
          tg.close();
        } else {
          // Fallback for non-Telegram environments
          console.warn("close() not available, running outside Telegram");
        }
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [setTokens, setUser, setLoading, accessToken]);
};
