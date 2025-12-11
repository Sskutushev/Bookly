// frontend/src/features/auth/ui/TwoFactorAuthForm.tsx

import React, { useState } from 'react';
import { authenticateWithTwoFactor } from '@/features/auth/api/auth-api';

// Types
interface TwoFactorAuthFormProps {
  userId: string;
  onAuthSuccess: (tokens: { access_token: string; refresh_token: string }) => void;
  onCancel: () => void;
}

const TwoFactorAuthForm: React.FC<TwoFactorAuthFormProps> = ({ userId, onAuthSuccess, onCancel }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authenticateWithTwoFactor(userId, token);
      if (response.authenticated) {
        onAuthSuccess(response.tokens);
      } else {
        setError('Неверный код 2FA');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка аутентификации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-6">
        Двухфакторная аутентификация
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
            htmlFor="token"
          >
            Введите код из приложения:
          </label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-bg-light dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>
        
        <div className="mb-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary-light dark:bg-primary-dark text-white rounded-button font-medium disabled:opacity-50"
          >
            {loading ? 'Проверка...' : 'Проверить код'}
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Откройте приложение аутентификации и введите код
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="text-primary-light dark:text-primary-dark hover:underline"
          >
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorAuthForm;