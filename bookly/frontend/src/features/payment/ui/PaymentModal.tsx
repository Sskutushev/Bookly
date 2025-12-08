// frontend/src/features/payment/ui/PaymentModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuthStore } from '../../../entities/user/model/use-auth-store';
import { api } from '../../../shared/api';
import { hapticFeedback } from '../../../shared/lib/telegram-haptic';
import { showPopup, showAlert } from '../../../shared/lib/telegram-dialogs';
import { TelegramMainButton } from '../../../shared/lib/telegram-main-button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  bookPrice: number;
}

interface InvoiceResponse {
  invoiceLink: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  bookId, 
  bookTitle, 
  bookAuthor, 
  bookCover, 
  bookPrice 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (isOpen) {
      // Configure Telegram Main Button
      TelegramMainButton.show(`Оплатить ${bookPrice} XTR`, handlePayment);
    } else {
      TelegramMainButton.hide();
    }

    return () => {
      TelegramMainButton.hide();
    };
  }, [isOpen, bookPrice]);

  const handlePayment = async () => {
    if (!user) {
      showAlert('Пожалуйста, войдите в систему для покупки книги.');
      return;
    }

    setIsLoading(true);
    TelegramMainButton.showProgress(true);

    try {
      // Create invoice
      const response = await api.post<InvoiceResponse>('/payment/create-invoice', {
        bookId,
        userId: user.id
      });

      const { invoiceLink } = response.data;

      // Open invoice in Telegram
      tg.openInvoice(invoiceLink, async (status: string) => {
        hapticFeedback.notificationOccurred('success');
        
        switch (status) {
          case 'paid':
            showPopup({
              title: 'Успешная покупка!',
              message: `Книга "${bookTitle}" успешно куплена!`,
              buttons: [{ id: 'ok', text: 'Читать' }]
            }).then((buttonId) => {
              if (buttonId === 'ok') {
                window.location.href = `/reader/${bookId}`;
              }
              onClose();
            });
            break;
          case 'cancelled':
            hapticFeedback.notificationOccurred('warning');
            showPopup({
              title: 'Оплата отменена',
              message: 'Вы отменили процесс оплаты.',
              buttons: [{ id: 'ok', text: 'OK' }]
            });
            break;
          case 'failed':
            hapticFeedback.notificationOccurred('error');
            showPopup({
              title: 'Ошибка оплаты',
              message: 'Произошла ошибка при оплате. Пожалуйста, попробуйте снова.',
              buttons: [{ id: 'ok', text: 'OK' }]
            });
            break;
          default:
            hapticFeedback.notificationOccurred('error');
            showAlert('Неизвестный статус оплаты');
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      hapticFeedback.notificationOccurred('error');
      showAlert('Ошибка при создании инвойса. Пожалуйста, попробуйте снова.');
    } finally {
      setIsLoading(false);
      TelegramMainButton.showProgress(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-[#1A1A2E]">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
              >
                Оформление покупки
              </Dialog.Title>

              <div className="mt-2 flex items-center space-x-4">
                <img 
                  src={bookCover} 
                  alt={bookTitle} 
                  className="w-16 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{bookTitle}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{bookAuthor}</p>
                  <p className="text-lg font-bold text-[#8B7FF5] dark:text-[#9B8AFF]">{bookPrice} XTR</p>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Способ оплаты:</h5>
                <div className="flex items-center p-3 bg-gray-100 dark:bg-[#0F0F1E] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#8B7FF5] flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                  <span className="text-gray-900 dark:text-white">Telegram Stars</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                  onClick={onClose}
                >
                  Отмена
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PaymentModal;