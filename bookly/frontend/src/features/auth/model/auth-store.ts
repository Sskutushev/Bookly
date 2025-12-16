// src/features/auth/model/auth-store.ts

import { create } from 'zustand';
import { axiosInstance } from '../../../shared/api/axios-instance';
import { UserProfile } from './types';

type User = UserProfile;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (userData) => set({ user: userData, isAuthenticated: true, isLoading: false }),
  
  logout: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  
  updateUser: (userData) => 
    set((state) => ({ 
      user: state.user ? { ...state.user, ...userData } : null 
    })),
  
  initAuth: async () => {
    // First check if we're in Telegram WebApp
    if (window.Telegram?.WebApp) {
      // In Telegram WebApp, we use Telegram's initData for authentication
      try {
        // Check if we have tokens in localStorage
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
          // Verify the token by fetching user data
          const response = await axiosInstance.get('/api/user/profile');
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          // No token in localStorage, try to authenticate with Telegram
          const tgInitData = window.Telegram.WebApp.initData;
          if (tgInitData) {
            // Make a request to auth with Telegram
            const guestId = localStorage.getItem('guestId');
            const response = await axiosInstance.post('/api/auth/telegram', {
              initData: tgInitData,
              guestId: guestId || null,
            });

            const { user, tokens } = response.data;

            // Save tokens
            localStorage.setItem('accessToken', tokens.access_token);
            localStorage.setItem('refreshToken', tokens.refresh_token);

            set({
              user: user,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            // We're in Telegram but no initData - likely not opened from Telegram
            set({ isLoading: false });
          }
        }
      } catch (error) {
        console.error('Telegram auth error:', error);
        // If Telegram auth fails, just continue with unauthenticated state
        set({ isLoading: false });
      }
    } else {
      // Not in Telegram WebApp - try regular token-based auth
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        set({ isLoading: false });
        return;
      }

      try {
        // Verify the token by fetching user data
        const response = await axiosInstance.get('/api/user/profile');
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        // If token is invalid, remove it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ isLoading: false });
      }
    }
  }
}));