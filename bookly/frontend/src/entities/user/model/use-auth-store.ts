// bookly/frontend/src/entities/user/model/use-auth-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  telegram_id: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setTokens: (access, refresh) => {
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: !!access,
        });
      },

      setUser: (user) => {
        set({ user, isLoading: false });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({ 
        // persist only tokens, not the user object or loading state
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
