// frontend/src/pages/ProfilePage/ProfilePage.tsx

import React, { useState } from 'react';
import { useAuthStore } from '../../entities/user/model/use-auth-store';
import { api } from '../../shared/api';
import { showPopup, showAlert } from '../../shared/lib/telegram-dialogs';
import { hapticFeedback } from '../../shared/lib/telegram-haptic';
import { useQuery } from '@tanstack/react-query';

interface NotificationSettings {
  id?: string;
  newBooksInGenre: boolean;
  unfinishedReminder: boolean;
  specialOffers: boolean;
  frequency: 'daily' | '3days' | 'weekly';
  telegramEnabled: boolean;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false); // This would normally come from user data

  const { data: notificationSettings, isLoading: settingsLoading, refetch } = useQuery<NotificationSettings>({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await api.get('/notifications/settings');
      return response.data;
    },
    enabled: user !== null
  });

  const handleLogout = async () => {
    hapticFeedback.warning();
    
    const result = await showPopup({
      title: 'Выход',
      message: 'Вы уверены, что хотите выйти из аккаунта?',
      buttons: [
        { id: 'cancel', text: 'Отмена', type: 'cancel' },
        { id: 'logout', text: 'Выйти', type: 'destructive' }
      ]
    });

    if (result === 'logout') {
      logout();
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await api.patch('/user/profile', {
        name: editName
      });

      hapticFeedback.success();
      showAlert('Профиль успешно обновлен!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      hapticFeedback.error();
      showAlert('Ошибка при обновлении профиля');
    }
  };

  const handleSaveEmail = async () => {
    if (!user || !newEmail) return;

    try {
      await api.patch('/user/email', {
        email: newEmail,
        password: currentPassword
      });

      hapticFeedback.success();
      showAlert('Email успешно обновлен!');
      setIsEditingEmail(false);
      setNewEmail('');
      setCurrentPassword('');
    } catch (error) {
      console.error('Error updating email:', error);
      hapticFeedback.error();
      showAlert('Ошибка при обновлении email');
    }
  };

  const handleSavePassword = async () => {
    if (!user || newPassword !== confirmNewPassword) return;

    try {
      await api.patch('/user/password', {
        currentPassword,
        newPassword
      });

      hapticFeedback.success();
      showAlert('Пароль успешно обновлен!');
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      hapticFeedback.error();
      showAlert('Ошибка при обновлении пароля');
    }
  };

  const handleToggle2FA = async () => {
    hapticFeedback.selection();
    
    if (is2FAEnabled) {
      // Disable 2FA
      try {
        await api.post('/auth/2fa/disable');
        setIs2FAEnabled(false);
        hapticFeedback.success();
        showAlert('Двухфакторная аутентификация отключена');
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        hapticFeedback.error();
        showAlert('Ошибка при отключении 2FA');
      }
    } else {
      // Enable 2FA - Show QR code modal
      try {
        const response = await api.post('/auth/2fa/setup');
        const { qrCode, secret } = response.data;
        
        // Show QR code modal
        showPopup({
          title: 'Настройка 2FA',
          message: 'Отсканируйте QR-код с помощью Google Authenticator',
          buttons: [
            { id: 'done', text: 'Готово' }
          ]
        }).then(async (buttonId) => {
          if (buttonId === 'done') {
            // Verify the code
            const code = prompt('Введите код из приложения:');
            if (code) {
              try {
                await api.post('/auth/2fa/verify', { token: code, secret });
                setIs2FAEnabled(true);
                hapticFeedback.success();
                showAlert('2FA успешно настроена!');
              } catch (error) {
                console.error('Error verifying 2FA:', error);
                hapticFeedback.error();
                showAlert('Неправильный код. Попробуйте еще раз.');
              }
            }
          }
        });
      } catch (error) {
        console.error('Error setting up 2FA:', error);
        hapticFeedback.error();
        showAlert('Ошибка при настройке 2FA');
      }
    }
  };

  const handleUpdateNotificationSettings = async (settings: NotificationSettings) => {
    try {
      await api.patch('/notifications/settings', settings);
      refetch(); // Refresh the settings
      hapticFeedback.success();
      showAlert('Настройки уведомлений обновлены');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      hapticFeedback.error();
      showAlert('Ошибка при обновлении настроек уведомлений');
    }
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FE] dark:bg-[#0F0F1E] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A2E] dark:text-white">Профиль</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar (Desktop) */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-lg p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Мой профиль' },
                  { id: 'purchases', label: 'Мои покупки' },
                  { id: 'security', label: 'Вход и безопасность' },
                  { id: 'notifications', label: 'Уведомления' },
                  { id: 'help', label: 'Помощь' }
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#8B7FF5] text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0F0F1E]'
                    }`}
                    onClick={() => {
                      hapticFeedback.selection();
                      setActiveTab(item.id);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <button
                className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4 flex items-center"
                onClick={handleLogout}
              >
                <span>Выйти</span>
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden mb-4">
            <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-lg p-2">
              <div className="grid grid-cols-2 gap-1">
                {[
                  { id: 'profile', label: '👤 Профиль' },
                  { id: 'security', label: '🔒 Безоп.' },
                  { id: 'notifications', label: '🔔 Уведомл.' },
                  { id: 'help', label: '❓ Помощь' }
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`px-3 py-2 rounded-xl transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#8B7FF5] text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      hapticFeedback.selection();
                      setActiveTab(item.id);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Мой профиль</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Аватар</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Это будет отображаться в профиле</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Имя</label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#0F0F1E] text-gray-900 dark:text-white"
                        />
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded-xl"
                          onClick={() => {
                            hapticFeedback.light();
                            handleSaveProfile();
                          }}
                        >
                          Сохранить
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl"
                          onClick={() => {
                            hapticFeedback.light();
                            setIsEditing(false);
                            setEditName(user?.name || '');
                          }}
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <p className="text-gray-900 dark:text-white">{user.name}</p>
                        <button
                          className="px-4 py-2 bg-[#8B7FF5] text-white rounded-xl"
                          onClick={() => {
                            hapticFeedback.light();
                            setIsEditing(true);
                          }}
                        >
                          Редактировать
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Telegram</label>
                    <p className="text-gray-900 dark:text-white">✓ Привязан: {user.telegram_id}</p>
                    <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm">
                      Отвязать
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Мои покупки</h2>
                
                <div className="space-y-4">
                  {settingsLoading ? (
                    <p>Загрузка покупок...</p>
                  ) : (
                    <p>Здесь будут отображаться ваши покупки книг.</p>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Вход и безопасность</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Email</label>
                    {isEditingEmail ? (
                      <div className="space-y-3">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Новый email"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#0F0F1E] text-gray-900 dark:text-white"
                        />
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Текущий пароль для подтверждения"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#0F0F1E] text-gray-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-2 bg-green-500 text-white rounded-xl"
                            onClick={() => {
                              hapticFeedback.light();
                              handleSaveEmail();
                            }}
                          >
                            Сохранить
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl"
                            onClick={() => {
                              hapticFeedback.light();
                              setIsEditingEmail(false);
                              setNewEmail('');
                              setCurrentPassword('');
                            }}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <p className="text-gray-900 dark:text-white">{user.email}</p>
                        <button
                          className="px-4 py-2 bg-[#8B7FF5] text-white rounded-xl"
                          onClick={() => {
                            hapticFeedback.light();
                            setIsEditingEmail(true);
                          }}
                        >
                          Изменить
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Пароль</label>
                    {isEditingPassword ? (
                      <div className="space-y-3">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Текущий пароль"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#0F0F1E] text-gray-900 dark:text-white"
                        />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Новый пароль"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#0F0F1E] text-gray-900 dark:text-white"
                        />
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Повторите новый пароль"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#0F0F1E] text-gray-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-2 bg-green-500 text-white rounded-xl"
                            onClick={() => {
                              hapticFeedback.light();
                              handleSavePassword();
                            }}
                          >
                            Изменить
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl"
                            onClick={() => {
                              hapticFeedback.light();
                              setIsEditingPassword(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmNewPassword('');
                            }}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <p className="text-gray-900 dark:text-white">••••••••</p>
                        <button
                          className="px-4 py-2 bg-[#8B7FF5] text-white rounded-xl"
                          onClick={() => {
                            hapticFeedback.light();
                            setIsEditingPassword(true);
                          }}
                        >
                          Изменить
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Двухфакторная аутентификация</label>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-900 dark:text-white">
                        {is2FAEnabled ? 'Включена' : 'Выключена'}
                      </p>
                      <button
                        className={`px-4 py-2 rounded-xl ${
                          is2FAEnabled 
                            ? 'bg-red-500 text-white' 
                            : 'bg-[#8B7FF5] text-white'
                        }`}
                        onClick={handleToggle2FA}
                      >
                        {is2FAEnabled ? 'Отключить' : 'Включить'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && notificationSettings && (
              <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Настройки уведомлений</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Типы уведомлений</label>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-900 dark:text-white">Новые книги в избранных жанрах</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Получать уведомления о новых книгах в жанрах, которые вы читаете</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notificationSettings.newBooksInGenre}
                            onChange={(e) => handleUpdateNotificationSettings({
                              ...notificationSettings,
                              newBooksInGenre: e.target.checked
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#8B7FF5]"></div>
                        </label>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-900 dark:text-white">Напоминание о недочитанных книгах</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Получать напоминания, если вы давно не читали книгу</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notificationSettings.unfinishedReminder}
                            onChange={(e) => handleUpdateNotificationSettings({
                              ...notificationSettings,
                              unfinishedReminder: e.target.checked
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#8B7FF5]"></div>
                        </label>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-900 dark:text-white">Специальные предложения</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Получать информацию о скидках и специальных предложениях</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notificationSettings.specialOffers}
                            onChange={(e) => handleUpdateNotificationSettings({
                              ...notificationSettings,
                              specialOffers: e.target.checked
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#8B7FF5]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Частота напоминаний</label>
                    <div className="flex gap-3">
                      {(['daily', '3days', 'weekly'] as const).map((freq) => (
                        <button
                          key={freq}
                          className={`px-4 py-2 rounded-xl ${
                            notificationSettings.frequency === freq
                              ? 'bg-[#8B7FF5] text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                          }`}
                          onClick={() => handleUpdateNotificationSettings({
                            ...notificationSettings,
                            frequency: freq
                          })}
                        >
                          {freq === 'daily' && 'Каждый день'}
                          {freq === '3days' && 'Раз в 3 дня'}
                          {freq === 'weekly' && 'Раз в неделю'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Telegram-уведомления</label>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-900 dark:text-white">Включены</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Уведомления будут отправляться в Telegram</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings.telegramEnabled}
                          onChange={(e) => handleUpdateNotificationSettings({
                            ...notificationSettings,
                            telegramEnabled: e.target.checked
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#8B7FF5]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Tab */}
            {activeTab === 'help' && (
              <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Помощь</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: '🚀 Как начать', desc: 'Краткое руководство по использованию приложения', icon: '🚀' },
                    { title: '💳 Способы оплаты', desc: 'Telegram Stars, как совершать покупки', icon: '💳' },
                    { title: '📖 Как читать книги', desc: 'Reader, закладки, настройки', icon: '📖' },
                    { title: '❤️ Избранное и коллекции', desc: 'Организация личной библиотеки', icon: '❤️' },
                    { title: '🔐 Безопасность', desc: '2FA, смена пароля, приватность', icon: '🔐' },
                    { title: '📧 Связь с поддержкой', desc: 'support@bookly.app', icon: '📧' }
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-[#0F0F1E] cursor-pointer transition-colors"
                      onClick={() => {
                        hapticFeedback.light();
                        showPopup({
                          title: item.title,
                          message: item.desc,
                          buttons: [
                            { id: 'ok', text: 'OK', type: 'default' }
                          ]
                        });
                      }}
                    >
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">{item.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;