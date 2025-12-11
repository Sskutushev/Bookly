// frontend/src/widgets/HelpSection/HelpSection.tsx

import React from 'react';
import { Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@/shared/ui/Accordion';

const HelpSection: React.FC = () => {
  const helpItems = [
    {
      id: 'getting-started',
      title: '🚀 Как начать',
      icon: '🚀',
      content: 'Чтобы начать пользоваться Bookly, просто зарегистрируйтесь или войдите через Telegram. После этого вы сможете просматривать книги, добавлять их в избранное и читать прямо в приложении.'
    },
    {
      id: 'payment-methods',
      title: '💳 Способы оплаты',
      icon: '💳',
      content: 'Мы поддерживаем оплату через Telegram Stars, ЮKassa и криптовалюту (USDT TON и TRC20). Выберите удобный для вас способ при покупке книги.'
    },
    {
      id: 'reading-books',
      title: '📖 Как читать книги',
      icon: '📖',
      content: 'Для чтения книги откройте ее карточку и нажмите "Читать". В полноэкранном режиме вы можете перелистывать страницы, использовать настройки чтения и ставить закладки.'
    },
    {
      id: 'favorites',
      title: '❤️ Избранное и коллекции',
      icon: '❤️',
      content: 'Добавляйте книги в избранное, чтобы легко находить их позже. Вы можете сортировать и фильтровать книги в избранном по жанрам и другим критериям.'
    },
    {
      id: 'security',
      title: '🔐 Безопасность',
      icon: '🔐',
      content: 'Мы используем двухфакторную аутентификацию для защиты ваших данных. Включите 2FA в настройках безопасности профиля.'
    },
    {
      id: 'support',
      title: '📧 Связь с поддержкой',
      icon: '📧',
      content: 'Если у вас возникли вопросы, напишите нам на support@bookly.app или в Telegram: @bookly_support'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-8 text-center">
        ❓ Помощь
      </h2>

      <Accordion defaultValue={helpItems[0].id}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
            >
              <AccordionItem value={item.id}>
                <AccordionHeader>
                  <div className="p-6 cursor-pointer">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{item.icon}</span>
                      <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </AccordionHeader>

                <AccordionPanel className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    {item.content}
                  </p>
                </AccordionPanel>
              </AccordionItem>
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  );
};

export default HelpSection;