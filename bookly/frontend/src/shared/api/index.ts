// bookly/frontend/src/shared/api/index.ts
import axios from 'axios';
import { useAuthStore } from '../../entities/user/model/use-auth-store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Request Interceptor: Add Auth Headers
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    const tgData = window.Telegram?.WebApp?.initData;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (tgData) {
      config.headers['X-Telegram-Init-Data'] = tgData;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    // If error is 401, it's not a refresh token retry, and a refresh token exists
    if (error.response.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;
        
        // Update the store and localStorage
        setTokens(newAccessToken, newRefreshToken);
        
        // Update the header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // If refresh fails, log out the user
        logout();
        window.Telegram?.WebApp?.close();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
