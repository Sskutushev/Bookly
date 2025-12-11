// frontend/src/features/auth/ui/LoginForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/auth-store';
import { loginWithEmailAndPassword } from '@/features/auth/api/auth-api';

interface LoginFormProps {
  on2FANeeded?: (userId: string) => void;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ on2FANeeded, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginWithEmailAndPassword(email, password);

      // Check if 2FA is enabled and required
      if (response.user?.twoFactorEnabled) {
        // Store the user ID for 2FA verification
        if (on2FANeeded && response.user.id) {
          on2FANeeded(response.user.id);
          return;
        }
      }

      // If no 2FA, proceed with normal login
      login(response.user);
      localStorage.setItem('accessToken', response.tokens.access_token);
      localStorage.setItem('refreshToken', response.tokens.refresh_token);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-6">
        Вход в аккаунт
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-text-primary-light dark:text-text-primary-dark mb-2"
            htmlFor="email"
          >
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-bg-light dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-text-primary-light dark:text-text-primary-dark mb-2"
            htmlFor="password"
          >
            Пароль:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-bg-light dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark"
            required
          />
        </div>

        <div className="mb-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary-light dark:bg-primary-dark text-white rounded-button font-medium disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Нет аккаунта?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-primary-light dark:text-primary-dark hover:underline"
            >
              Регистрация
            </button>
          </p>
          <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
            <a
              href="/forgot-password"
              className="text-primary-light dark:text-primary-dark hover:underline"
            >
              Забыли пароль?
            </a>
          </p>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark">
                или
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                // This would trigger Telegram auth
                // In a real app, you'd use the WebApp SDK for Telegram auth
                alert('Для входа через Telegram, пожалуйста, откройте приложение в Telegram');
              }}
              className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-button font-medium"
            >
              <span className="mr-2">🔵</span>
              Войти через Telegram
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;