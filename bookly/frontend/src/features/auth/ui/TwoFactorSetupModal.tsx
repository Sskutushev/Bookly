// frontend/src/features/auth/ui/TwoFactorSetupModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import QRCode from 'qrcode.react';
import { setupTwoFactor, verifyTwoFactorSetup } from '@/features/auth/api/auth-api';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize 2FA setup
  useEffect(() => {
    if (isOpen && step === 'setup') {
      const initSetup = async () => {
        try {
          setLoading(true);
          const response = await setupTwoFactor();
          setSecret(response.secret);
          setQrCodeUrl(response.qrCodeUrl);
        } catch (err: any) {
          setError(err.message || 'Ошибка настройки 2FA');
        } finally {
          setLoading(false);
        }
      };

      initSetup();
    }
  }, [isOpen, step]);

  const handleVerify = async () => {
    if (!token) {
      setError('Введите код из приложения');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await verifyTwoFactorSetup(token);
      if (response.verified) {
        onComplete();
        onClose();
      } else {
        setError('Неверный код. Попробуйте снова.');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка проверки кода');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep('setup');
    setToken('');
    setError('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-text-primary-light dark:text-text-primary-dark mb-4"
                >
                  {step === 'setup' ? 'Настройка 2FA' : 'Проверка 2FA'}
                </Dialog.Title>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
                  </div>
                ) : step === 'setup' ? (
                  <div className="mt-2">
                    <p className="text-text-primary-light dark:text-text-primary-dark mb-4">
                      Отсканируйте QR-код с помощью Google Authenticator или другого приложения:
                    </p>
                    
                    <div className="flex justify-center mb-4">
                      {qrCodeUrl && secret && (
                        <div className="bg-white p-4 rounded-lg">
                          <QRCode 
                            value={qrCodeUrl} 
                            size={200} 
                            level="H"
                          />
                        </div>
                      )}
                    </div>
                    
                    {secret && (
                      <div className="mb-4">
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-2">
                          Или введите код вручную:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg font-mono text-center">
                          {secret}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                      После добавления аккаунта в приложение нажмите "Продолжить"
                    </p>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm rounded-button bg-primary-light dark:bg-primary-dark text-white"
                        onClick={() => setStep('verify')}
                      >
                        Продолжить
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-text-primary-light dark:text-text-primary-dark mb-4">
                      Введите 6-значный код из приложения:
                    </p>
                    
                    <div className="mb-4">
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-bg-light dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark text-center text-xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>
                    
                    {error && (
                      <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                        {error}
                      </div>
                    )}
                    
                    <div className="flex space-x-3 mt-6">
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 text-sm rounded-button bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark"
                        onClick={() => setStep('setup')}
                      >
                        Назад
                      </button>
                      <button
                        type="button"
                        className="flex-1 px-4 py-2 text-sm rounded-button bg-primary-light dark:bg-primary-dark text-white"
                        onClick={handleVerify}
                        disabled={!token}
                      >
                        Проверить
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TwoFactorSetupModal;