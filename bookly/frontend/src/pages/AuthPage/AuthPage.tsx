// frontend/src/pages/AuthPage/AuthPage.tsx

import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/auth-store';
import LoginForm from '@/features/auth/ui/LoginForm';
import RegisterForm from '@/features/auth/ui/RegisterForm';
import TwoFactorAuthForm from '@/features/auth/ui/TwoFactorAuthForm';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | '2fa'>('login');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleRegisterSuccess = () => {
    setMode('login');
  };

  const handle2faAuthSuccess = (tokens: { access_token: string; refresh_token: string }) => {
    // Login user with the tokens received from 2FA
    localStorage.setItem('accessToken', tokens.access_token);
    localStorage.setItem('refreshToken', tokens.refresh_token);
    handleLoginSuccess();
  };

  const handleLoginWith2FA = (userId: string) => {
    setPendingUserId(userId);
    setMode('2fa');
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {mode === 'login' && (
          <LoginForm 
            on2FANeeded={handleLoginWith2FA}
            onSuccess={handleLoginSuccess}
          />
        )}
        
        {mode === 'register' && (
          <RegisterForm onSuccess={handleRegisterSuccess} />
        )}
        
        {mode === '2fa' && pendingUserId && (
          <TwoFactorAuthForm 
            userId={pendingUserId} 
            onAuthSuccess={handle2faAuthSuccess}
            onCancel={() => setMode('login')}
          />
        )}

        <div className="mt-6 text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            {mode === 'login' 
              ? "Нет аккаунта? " 
              : "Уже есть аккаунт? "}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-primary-light dark:text-primary-dark font-medium hover:underline"
            >
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;