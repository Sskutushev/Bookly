import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '@/features/auth/api/auth-api';
import toast from 'react-hot-toast';

interface ForgotPasswordFormProps {
  variant?: 'forgot' | 'reset';
}

const PasswordResetForm: React.FC<ForgotPasswordFormProps> = ({ variant = 'forgot' }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      toast.success('Ссылка для восстановления пароля отправлена на ваш email');
      setEmail('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(token!, newPassword);
      toast.success('Пароль успешно изменен');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при смене пароля');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'reset') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Сброс пароля
        </h2>
        
        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">
              Новый пароль
            </label>
            <input
              type="password"
              id="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              minLength={8}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 mb-2">
              Подтвердите пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Загрузка...' : 'Сбросить пароль'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        Восстановление пароля
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
        Введите ваш email, и мы отправим ссылку для восстановления пароля
      </p>
      
      <form onSubmit={handleForgotPassword}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Загрузка...' : 'Отправить ссылку'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button 
          onClick={() => navigate('/login')}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Вспомнили пароль? Войти
        </button>
      </div>
    </div>
  );
};

export default PasswordResetForm;