import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast from 'react-hot-toast';

// API
import { createInvoice } from '../../features/payment/api/payment-api';

// Types
import { Book } from '../../entities/book/model/types';

interface PaymentModalProps {
  book: Book;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ book, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create invoice
      const invoiceLink = await createInvoice(book.id);
      
      // Open Telegram invoice
      (window as any).Telegram?.WebApp?.openInvoice(
        invoiceLink,
        (status: string) => {
          setIsProcessing(false);
          
          if (status === 'paid') {
            toast.success('Книга куплена!');
            onSuccess();
          } else if (status === 'cancelled') {
            toast.error('Платеж отменен');
            onClose();
          } else if (status === 'failed') {
            toast.error('Ошибка платежа');
          }
        }
      );
    } catch (error) {
      setIsProcessing(false);
      toast.error('Ошибка при создании инвойса');
      console.error(error);
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
                        defaultChecked
                      />
                      <label htmlFor="telegram-stars" className="text-text-primary-light dark:text-text-primary-dark">
                        Telegram Stars
                      </label>
                    </div>
                    
                    <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-button opacity-50">
                      <input
                        type="radio"
                        id="yookassa"
                        name="payment-method"
                        className="mr-3"
                        disabled
                      />
                      <label htmlFor="yookassa" className="text-text-primary-light dark:text-text-primary-dark">
                        ЮKassa (скоро)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className={`w-full px-4 py-3 rounded-button bg-primary-light dark:bg-primary-dark text-white font-medium ${
                      isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Обработка...' : `Оплатить ${book.price}₽`}
                  </button>
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