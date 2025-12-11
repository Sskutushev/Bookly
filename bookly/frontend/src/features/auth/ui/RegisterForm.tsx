// frontend/src/features/auth/ui/RegisterForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerWithEmailAndPassword } from '@/features/auth/api/auth-api';

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerWithEmailAndPassword(name, email, password);
      // Registration successful
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/auth'); // Redirect to auth page to login
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-6">
        Регистрация
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
            htmlFor="name"
          >
            Имя:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-bg-light dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark"
            required
          />
        </div>

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
          <label
            className="block text-text-primary-light dark:text-text-primary-dark mb-2"
            htmlFor="confirmPassword"
          >
            Повторите пароль:
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-bg-light dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark"
            required
          />
        </div>

        <div className="mb-4 flex items-start">
          <input
            id="terms"
            type="checkbox"
            className="mt-1 mr-2"
            required
          />
          <label
            htmlFor="terms"
            className="text-text-secondary-light dark:text-text-secondary-dark text-sm"
          >
            Я согласен с условиями использования
          </label>
        </div>

        <div className="mb-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary-light dark:bg-primary-dark text-white rounded-button font-medium disabled:opacity-50"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Уже есть аккаунт?{' '}
            <button
              onClick={() => navigate('/auth')}
              className="text-primary-light dark:text-primary-dark hover:underline"
            >
              Войти
            </button>
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
                // This would trigger Telegram registration
                alert('Для регистрации через Telegram, пожалуйста, откройте приложение в Telegram');
              }}
              className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-button font-medium"
            >
              <span className="mr-2">🔵</span>
              Регистрация через Telegram
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;