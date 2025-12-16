import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast from 'react-hot-toast';

// API
import {
  createInvoice,
  createYookassaPayment,
  createUsdtTonPayment,
  createUsdtTrc20Payment
} from '@/features/payment/api/payment-api';

// Types
import { Book } from '@/entities/book/model/types';

// Telegram helpers
import { mainButton } from '@/shared/lib/telegram-main-button';
import { haptic } from '@/shared/lib/haptic';
import { telegramDialogs } from '@/shared/lib/telegram-dialogs';

interface PaymentModalProps {
  book: Book;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ book, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'telegram' | 'yookassa' | 'usdt-ton' | 'usdt-trc20'>('telegram');

  // Use Telegram MainButton when modal is open
  useEffect(() => {
    if (book) {
      // Show MainButton with payment text
      mainButton.show(`Оплатить ${book.price}₽`, handlePayment);
      // mainButton.setColor('#8B7FF5'); // setColor is not a standard method, removing for now
    }

    // Clean up on unmount
    return () => {
      mainButton.hide();
    };
  }, [book, selectedMethod]);

  const handleTelegramPayment = async () => {
    setIsProcessing(true);
    mainButton.showProgress();
    mainButton.disable();

    try {
      // Create invoice
      const invoiceLink = await createInvoice(book.id);

      if (invoiceLink) {
        // Open Telegram invoice
        (window as any).Telegram?.WebApp?.openInvoice(
          invoiceLink,
          async (status: string) => {
            setIsProcessing(false);
            mainButton.hideProgress();
            mainButton.enable();

            if (status === 'paid') {
              haptic.success();
              await telegramDialogs.alert('Книга успешно куплена!');
              onSuccess();
            } else if (status === 'cancelled') {
              haptic.warning();
              onClose();
            } else if (status === 'failed') {
              haptic.error();
              await telegramDialogs.alert('Ошибка оплаты. Попробуйте снова.');
            }
          }
        );
      }
    } catch (error) {
      setIsProcessing(false);
      mainButton.hideProgress();
      mainButton.enable();
      haptic.error();
      await telegramDialogs.alert('Ошибка при создании инвойса');
      console.error(error);
    }
  };

  const handleYookassaPayment = async () => {
    setIsProcessing(true);
    mainButton.showProgress();
    mainButton.disable();

    try {
      const response = await createYookassaPayment(book.id);

      if (response.confirmationUrl) {
        // Open the confirmation page in a new tab or window
        window.open(response.confirmationUrl, '_blank');
        toast.success('Переадресовано на страницу оплаты');
        onSuccess(); // Close the modal after successful initiation
      }
    } catch (error) {
      setIsProcessing(false);
      mainButton.hideProgress();
      mainButton.enable();
      haptic.error();
      await telegramDialogs.alert('Ошибка при создании платежа ЮKassa');
      console.error(error);
    }
  };

  const handleUsdtTonPayment = async () => {
    try {
      const response = await createUsdtTonPayment(book.id);

      if (response.address) {
        // Show Telegram popup instead of browser confirm
        const action = await telegramDialogs.popup({
          title: 'Оплата USDT (TON)',
          message: `Адрес для оплаты: ${response.address}\nСкопируйте и продолжите оплату.`,
          buttons: [
            { id: 'copy', type: 'default', text: 'Скопировать' },
            { id: 'cancel', type: 'cancel', text: 'Отмена' }
          ]
        });

        if (action === 'copy') {
          navigator.clipboard.writeText(response.address);
          toast.success('Адрес скопирован в буфер обмена');
          onSuccess(); // Close the modal after successful initiation
        }
      }
    } catch (error) {
      haptic.error();
      await telegramDialogs.alert('Ошибка при создании USDT TON платежа');
      console.error(error);
    }
  };

  const handleUsdtTrc20Payment = async () => {
    try {
      const response = await createUsdtTrc20Payment(book.id);

      if (response.address) {
        // Show Telegram popup instead of browser confirm
        const action = await telegramDialogs.popup({
          title: 'Оплата USDT (TRC20)',
          message: `Адрес для оплаты: ${response.address}\nСкопируйте и продолжите оплату.`,
          buttons: [
            { id: 'copy', type: 'default', text: 'Скопировать' },
            { id: 'cancel', type: 'cancel', text: 'Отмена' }
          ]
        });

        if (action === 'copy') {
          navigator.clipboard.writeText(response.address);
          toast.success('Адрес скопирован в буфер обмена');
          onSuccess(); // Close the modal after successful initiation
        }
      }
    } catch (error) {
      haptic.error();
      await telegramDialogs.alert('Ошибка при создании USDT TRC20 платежа');
      console.error(error);
    }
  };

  const handlePayment = async () => {
    // Haptic feedback for button press
    haptic.medium();

    switch (selectedMethod) {
      case 'telegram':
        await handleTelegramPayment();
        break;
      case 'yookassa':
        await handleYookassaPayment();
        break;
      case 'usdt-ton':
        await handleUsdtTonPayment();
        break;
      case 'usdt-trc20':
        await handleUsdtTrc20Payment();
        break;
      default:
        haptic.error();
        await telegramDialogs.alert('Выберите способ оплаты');
    }
  };

  return (
    <Transition appear show={!!book} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-text-primary-light dark:text-text-primary-dark"
                  >
                    Оформление покупки
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded-element"
                  />

                  <div>
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {book.title}
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {book.author}
                    </p>
                    <p className="text-lg font-bold text-primary-light dark:text-primary-dark">
                      {book.price}₽
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Выберите способ оплаты:
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-button">
                      <input
                        type="radio"
                        id="telegram-stars"
                        name="payment-method"
                        className="mr-3"
                        checked={selectedMethod === 'telegram'}
                        onChange={() => setSelectedMethod('telegram')}
                      />
                      <label htmlFor="telegram-stars" className="text-text-primary-light dark:text-text-primary-dark">
                        Telegram Stars
                      </label>
                    </div>

                    <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-button">
                      <input
                        type="radio"
                        id="yookassa"
                        name="payment-method"
                        className="mr-3"
                        checked={selectedMethod === 'yookassa'}
                        onChange={() => setSelectedMethod('yookassa')}
                      />
                      <label htmlFor="yookassa" className="text-text-primary-light dark:text-text-primary-dark">
                        ЮKassa (Карта, СБП)
                      </label>
                    </div>

                    <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-button">
                      <input
                        type="radio"
                        id="usdt-ton"
                        name="payment-method"
                        className="mr-3"
                        checked={selectedMethod === 'usdt-ton'}
                        onChange={() => setSelectedMethod('usdt-ton')}
                      />
                      <label htmlFor="usdt-ton" className="text-text-primary-light dark:text-text-primary-dark">
                        USDT (TON Network)
                      </label>
                    </div>

                    <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-button">
                      <input
                        type="radio"
                        id="usdt-trc20"
                        name="payment-method"
                        className="mr-3"
                        checked={selectedMethod === 'usdt-trc20'}
                        onChange={() => setSelectedMethod('usdt-trc20')}
                      />
                      <label htmlFor="usdt-trc20" className="text-text-primary-light dark:text-text-primary-dark">
                        USDT (TRC20)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Hidden button to maintain accessibility, but Telegram MainButton is used instead */}
                <div className="mt-6">
                  <button
                    type="button"
                    className="opacity-0 absolute w-0 h-0 overflow-hidden"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Обработка...' : `Оплатить ${book.price}₽`}
                  </button>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Оплата будет выполнена через кнопку Telegram
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PaymentModal;