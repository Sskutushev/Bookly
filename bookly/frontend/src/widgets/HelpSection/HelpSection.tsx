// frontend/src/widgets/HelpSection/HelpSection.tsx

import React, { useState } from 'react';
import { showPopup } from '../../shared/lib/telegram-dialogs';
import { hapticFeedback } from '../../shared/lib/telegram-haptic';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string;
}

const helpItems: HelpItem[] = [
  {
    id: 'getting-started',
    title: '🚀 Как начать',
    description: 'Краткое руководство по использованию приложения',
    icon: '🚀',
    details: '1. Зайдите в приложение Bookly через Telegram\n2. Просмотрите книги на главной странице\n3. Добавляйте книги в избранное или покупайте\n4. Откройте "Мои книги" для чтения\n\nНачните с просмотра бесплатных книг, чтобы ознакомиться с интерфейсом.'
  },
  {
    id: 'payment',
    title: '💳 Способы оплаты',
    description: 'Telegram Stars, как совершать покупки',
    icon: '💳',
    details: 'В приложении Bookly используется система оплаты Telegram Stars:\n\n- Откройте книгу, которую хотите приобрести\n- Нажмите кнопку "Купить"\n- Выберите "Оплатить через Telegram Stars"\n- Подтвердите оплату в окне Telegram\n\nTelegram Stars можно купить в разделе "Оплата" в Telegram.'
  },
  {
    id: 'reader',
    title: '📖 Как читать книги',
    description: 'Reader, закладки, настройки',
    icon: '📖',
    details: 'Интерфейс чтения книги включает:\n\n- Листание свайпом влево/вправо или кнопками\n- Настройки шрифта и темы в меню\n- Закладки для сохранения позиции\n- Отслеживание прогресса чтения\n\nЧтобы добавить закладку, нажмите и удерживайте страницу.'
  },
  {
    id: 'favorites',
    title: '❤️ Избранное и коллекции',
    description: 'Организация личной библиотеки',
    icon: '❤️',
    details: 'Управление избранными книгами:\n\n- Нажмите на иконку сердца на карточке книги\n- Избранные книги появятся на вкладке "Избранное"\n- В профиле можно сортировать по жанрам\n- Получайте уведомления о новых книгах в любимых жанрах'
  },
  {
    id: 'security',
    title: '🔐 Безопасность',
    description: '2FA, смена пароля, приватность',
    icon: '🔐',
    details: 'Настройки безопасности в приложении:\n\n- Включите двухфакторную аутентификацию в профиле\n- Регулярно меняйте пароль\n- Не передавайте свои данные другим\n- Проверяйте настройки уведомлений\n\nВаши данные защищены надежным шифрованием.'
  },
  {
    id: 'support',
    title: '📧 Связь с поддержкой',
    description: 'support@bookly.app и другие способы',
    icon: '📧',
    details: 'Служба поддержки доступна:\n\n- Email: support@bookly.app\n- Telegram: @bookly_support\n- В приложении через кнопку "Помощь" → "Связь с поддержкой"\n\nОтветы на часто задаваемые вопросы также доступны в разделе "Часто задаваемые вопросы".'
  }
];

const HelpSection: React.FC = () => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleItemClick = (item: HelpItem) => {
    hapticFeedback.light();
    showPopup({
      title: item.title,
      message: item.details,
      buttons: [
        { id: 'ok', text: 'OK', type: 'default' }
      ]
    });
  };

  const toggleExpand = (id: string) => {
    hapticFeedback.selection();
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">❓ Помощь</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {helpItems.map((item) => (
          <div 
            key={item.id} 
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-[#0F0F1E] cursor-pointer transition-colors"
            onClick={() => handleItemClick(item)}
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{item.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Часто задаваемые вопросы</h3>
        <div className="space-y-3">
          {[
            {
              question: "Как оплатить книги?",
              answer: "В Bookly используется система Telegram Stars для оплаты книг. Это внутренняя валюта Telegram, которую можно приобрести в настройках Telegram."
            },
            {
              question: "Как продолжить чтение книги?",
              answer: "Ваши книги сохраняются в разделе 'Мои книги'. При открытии книги вы продолжите чтение с последней прочитанной страницы."
            },
            {
              question: "Как настроить тему приложения?",
              answer: "Тема автоматически меняется в зависимости от настроек Telegram. Вы также можете настроить тему в читалке книг во время чтения."
            }
          ].map((faq, index) => (
            <div 
              key={index} 
              className="border-b border-gray-200 dark:border-gray-700 pb-3"
              onClick={() => {
                hapticFeedback.selection();
                showPopup({
                  title: faq.question,
                  message: faq.answer,
                  buttons: [
                    { id: 'ok', text: 'OK', type: 'default' }
                  ]
                });
              }}
            >
              <h4 className="font-medium text-gray-900 dark:text-white">{faq.question}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpSection;