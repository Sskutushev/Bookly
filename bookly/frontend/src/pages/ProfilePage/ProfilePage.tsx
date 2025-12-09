import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserPurchases,
  updateNotificationSettings 
} from '../features/auth/api/auth-api';

// Components
import TelegramBackButton from '../widgets/TelegramBackButton/TelegramBackButton';

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  telegram_username?: string;
}

interface Purchase {
  id: string;
  amount: number;
  createdAt: string;
  book: {
    title: string;
    author: string;
    coverUrl: string;
  };
}

interface NotificationSettings {
  newBooksInGenre: boolean;
  unfinishedReminder: boolean;
  specialOffers: boolean;
  newsAndUpdates: boolean;
  frequency: string;
  telegramEnabled: boolean;
}

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'purchases' | 'security' | 'notifications' | 'help'>('purchases');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  // Fetch user purchases
  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ['purchases'],
    queryFn: getUserPurchases,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Handle email update
  const handleEmailUpdate = () => {
    if (newEmail && currentPassword) {
      updateProfileMutation.mutate({ email: newEmail });
      setIsEditingEmail(false);
      setNewEmail('');
      setCurrentPassword('');
    }
  };

  // Handle password update
  const handlePasswordUpdate = () => {
    if (newPassword === confirmNewPassword && currentPassword) {
      // In a real app, you would send both current and new passwords
      updateProfileMutation.mutate({ password: newPassword });
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  // Handle notification settings change
  const handleNotificationChange = (setting: string, value: boolean | string) => {
    updateNotificationsMutation.mutate({ [setting]: value });
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark pb-20">
      <TelegramBackButton />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 backdrop-blur-md bg-white/80 dark:bg-bg-dark/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-light dark:text-primary-dark">
            Профиль
          </h1>
        </div>
      </header>

      <div className="pt-16 container mx-auto px-4">
        {/* User info section - visible on all views */}
        <div className="bg-white dark:bg-gray-800 rounded-card shadow p-6 mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-4">
              <span className="text-2xl">
                {profile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                {profile?.name}
              </h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                {profile?.email}
              </p>
              {profile?.telegram_username && (
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Telegram: @{profile.telegram_username}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Desktop layout - sidebar + content */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1 bg-white dark:bg-gray-800 rounded-card shadow p-4 h-fit">
            <nav>
              <button
                className={`w-full text-left px-4 py-3 rounded-button mb-2 ${
                  activeSection === 'purchases'
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveSection('purchases')}
              >
                📦 Мои покупки
              </button>
              <button
                className={`w-full text-left px-4 py-3 rounded-button mb-2 ${
                  activeSection === 'security'
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveSection('security')}
              >
                🔐 Вход и безопасность
              </button>
              <button
                className={`w-full text-left px-4 py-3 rounded-button mb-2 ${
                  activeSection === 'notifications'
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveSection('notifications')}
              >
                🔔 Уведомления
              </button>
              <button
                className={`w-full text-left px-4 py-3 rounded-button mb-2 ${
                  activeSection === 'help'
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveSection('help')}
              >
                ❓ Помощь
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-button text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4"
              >
                🚪 Выйти
              </button>
            </nav>
          </div>

          {/* Content area */}
          <div className="col-span-3">
            {activeSection === 'purchases' && (
              <div className="bg-white dark:bg-gray-800 rounded-card shadow p-6">
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                  История покупок
                </h3>
                
                {purchases.length > 0 ? (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div 
                        key={purchase.id} 
                        className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start">
                          <img
                            src={purchase.book.coverUrl}
                            alt={purchase.book.title}
                            className="w-16 h-20 object-cover rounded mr-4"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                              {purchase.book.title}
                            </h4>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                              {purchase.book.author}
                            </p>
                            <p className="text-text-primary-light dark:text-text-primary-dark mt-1">
                              {purchase.amount}₽ • {new Date(purchase.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    У вас пока нет покупок
                  </p>
                )}
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-white dark:bg-gray-800 rounded-card shadow p-6">
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                  Вход и безопасность
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Email
                    </h4>
                    <div className="flex justify-between items-center">
                      <p className="text-text-primary-light dark:text-text-primary-dark">
                        {profile?.email}
                      </p>
                      <button
                        className="text-primary-light dark:text-primary-dark hover:underline"
                        onClick={() => {
                          setIsEditingEmail(true);
                          setNewEmail(profile?.email || '');
                        }}
                      >
                        Изменить
                      </button>
                    </div>
                    
                    {isEditingEmail && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-button">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                            Новый email
                          </label>
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                            placeholder="Введите новый email"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                            Пароль для подтверждения
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                            placeholder="Введите текущий пароль"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-button"
                            onClick={handleEmailUpdate}
                          >
                            Сохранить
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button"
                            onClick={() => setIsEditingEmail(false)}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Пароль
                    </h4>
                    <div className="flex justify-between items-center">
                      <p className="text-text-primary-light dark:text-text-primary-dark">
                        ********
                      </p>
                      <button
                        className="text-primary-light dark:text-primary-dark hover:underline"
                        onClick={() => setIsEditingPassword(true)}
                      >
                        Изменить
                      </button>
                    </div>
                    
                    {isEditingPassword && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-button">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                            Текущий пароль
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                            placeholder="Введите текущий пароль"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                            Новый пароль
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                            placeholder="Введите новый пароль"
                          />
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                            Повторите пароль
                          </label>
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                            placeholder="Повторите новый пароль"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-button"
                            onClick={handlePasswordUpdate}
                          >
                            Изменить
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button"
                            onClick={() => setIsEditingPassword(false)}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Двухфакторная аутентификация
                    </h4>
                    <div className="flex justify-between items-center">
                      <p className="text-text-secondary-light dark:text-text-secondary-light">
                        Не включена
                      </p>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button">
                        Включить 2FA
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Привязанные аккаунты
                    </h4>
                    <div className="flex justify-between items-center">
                      <p className="text-text-primary-light dark:text-text-primary-light">
                        ✓ Telegram: @{profile?.telegram_username || 'не привязан'}
                      </p>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button">
                        {profile?.telegram_username ? 'Отвязать' : 'Привязать'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-white dark:bg-gray-800 rounded-card shadow p-6">
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                  Настройки уведомлений
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
                      Типы уведомлений
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                          Новые книги в избранных жанрах
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={true}
                            onChange={(e) => handleNotificationChange('newBooksInGenre', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/25 dark:peer-focus:ring-primary-dark/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                          Напоминание о недочитанных книгах
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={true}
                            onChange={(e) => handleNotificationChange('unfinishedReminder', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/25 dark:peer-focus:ring-primary-dark/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                          Специальные предложения
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={true}
                            onChange={(e) => handleNotificationChange('specialOffers', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/25 dark:peer-focus:ring-primary-dark/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary-light dark:text-text-primary-dark">
                          Новости и обновления
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={false}
                            onChange={(e) => handleNotificationChange('newsAndUpdates', e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/25 dark:peer-focus:ring-primary-dark/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
                      Частота напоминаний
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['daily', '3days', 'weekly'] as const).map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          className={`py-2 px-3 rounded-button text-sm ${
                            '3days' === freq // Using default value for demo
                              ? 'bg-primary-light dark:bg-primary-dark text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark'
                          }`}
                          onClick={() => handleNotificationChange('frequency', freq)}
                        >
                          {freq === 'daily' && 'Каждый день'}
                          {freq === '3days' && 'Раз в 3 дня'}
                          {freq === 'weekly' && 'Раз в неделю'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
                      Telegram-уведомления
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary-light dark:text-text-primary-dark">
                        Включены
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={true}
                          onChange={(e) => handleNotificationChange('telegramEnabled', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/25 dark:peer-focus:ring-primary-dark/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
                      </label>
                    </div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-light mt-1">
                      Бот: @bookly_notifications_bot
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'help' && (
              <div className="bg-white dark:bg-gray-800 rounded-card shadow p-6">
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                  ❓ Помощь
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-card">
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      🚀 Как начать
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-light">
                      Краткое руководство по использованию приложения
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-card">
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      💳 Способы оплаты
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-light">
                      ЮKassa, USDT TON, USDT TRC20
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-card">
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      📖 Как читать книги
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-light">
                      Reader, закладки, настройки
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-card">
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      ❤️ Избранное и коллекции
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-light">
                      Организация личной библиотеки
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-card">
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      🔐 Безопасность
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-light">
                      2FA, смена пароля, приватность
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-card">
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      📧 Связь с поддержкой
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-light">
                      support@bookly.app<br />
                      Telegram: @bookly_support
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile layout - tabs at the top */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
            {(['purchases', 'security', 'notifications', 'help'] as const).map((section) => (
              <button
                key={section}
                className={`px-4 py-2 rounded-button whitespace-nowrap ${
                  activeSection === section
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-white dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark'
                }`}
                onClick={() => setActiveSection(section)}
              >
                {section === 'purchases' && 'Покупки'}
                {section === 'security' && 'Безопасность'}
                {section === 'notifications' && 'Уведомления'}
                {section === 'help' && 'Помощь'}
              </button>
            ))}
          </div>

          {/* Content for mobile */}
          {activeSection === 'purchases' && (
            <div className="bg-white dark:bg-gray-800 rounded-card shadow p-6">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                История покупок
              </h3>
              
              {purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div 
                      key={purchase.id} 
                      className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start">
                        <img
                          src={purchase.book.coverUrl}
                          alt={purchase.book.title}
                          className="w-16 h-20 object-cover rounded mr-4"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                            {purchase.book.title}
                          </h4>
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            {purchase.book.author}
                          </p>
                          <p className="text-text-primary-light dark:text-text-primary-dark mt-1">
                            {purchase.amount}₽ • {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary-light dark:text-text-secondary-light">
                  У вас пока нет покупок
                </p>
              )}
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-card shadow p-6">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                Вход и безопасность
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Email
                  </h4>
                  <div className="flex justify-between items-center">
                    <p className="text-text-primary-light dark:text-text-primary-dark">
                      {profile?.email}
                    </p>
                    <button
                      className="text-primary-light dark:text-primary-dark hover:underline text-sm"
                      onClick={() => {
                        setIsEditingEmail(true);
                        setNewEmail(profile?.email || '');
                      }}
                    >
                      Изменить
                    </button>
                  </div>
                  
                  {isEditingEmail && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-button">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                          Новый email
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                          placeholder="Введите новый email"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                          Пароль для подтверждения
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                          placeholder="Введите текущий пароль"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-button"
                          onClick={handleEmailUpdate}
                        >
                          Сохранить
                        </button>
                        <button
                          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button"
                          onClick={() => setIsEditingEmail(false)}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Пароль
                  </h4>
                  <div className="flex justify-between items-center">
                    <p className="text-text-primary-light dark:text-text-primary-dark">
                      ********
                    </p>
                    <button
                      className="text-primary-light dark:text-primary-dark hover:underline text-sm"
                      onClick={() => setIsEditingPassword(true)}
                    >
                      Изменить
                    </button>
                  </div>
                  
                  {isEditingPassword && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-button">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                          Текущий пароль
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                          placeholder="Введите текущий пароль"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                          Новый пароль
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                          placeholder="Введите новый пароль"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                          Повторите пароль
                        </label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                          placeholder="Повторите новый пароль"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-button"
                          onClick={handlePasswordUpdate}
                        >
                          Изменить
                        </button>
                        <button
                          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button"
                          onClick={() => setIsEditingPassword(false)}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Двухфакторная аутентификация
                  </h4>
                  <div className="flex justify-between items-center">
                    <p className="text-text-secondary-light dark:text-text-secondary-light">
                      Не включена
                    </p>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button text-sm">
                      Включить 2FA
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Привязанные аккаунты
                  </h4>
                  <div className="flex justify-between items-center">
                    <p className="text-text-primary-light dark:text-text-primary-light">
                      ✓ Telegram: @{profile?.telegram_username || 'не привязан'}
                    </p>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button text-sm">
                      {profile?.telegram_username ? 'Отвязать' : 'Привязать'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications and Help sections would be similar to desktop but simplified for mobile */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;