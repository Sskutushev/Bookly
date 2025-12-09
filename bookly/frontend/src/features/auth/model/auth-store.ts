// src/features/auth/model/auth-store.ts

import { create } from 'zustand';
import { axiosInstance } from '../../../shared/api/axios-instance';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  telegram_id?: string;
  telegram_username?: string;
}

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
    // Check if we have tokens in localStorage
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
}));