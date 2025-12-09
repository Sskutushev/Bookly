// src/features/auth/ui/AuthProvider.tsx

import React, { ReactNode, createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../model/auth-store';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: any) => void;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    updateUser,
    initAuth 
  } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};