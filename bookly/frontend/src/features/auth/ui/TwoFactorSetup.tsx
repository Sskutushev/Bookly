import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { setupTwoFactor, verifyTwoFactor } from '@/features/auth/api/auth-api';
import toast from 'react-hot-toast';

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'init' | 'setup' | 'verify' | 'completed'>('init');
  const [secret, setSecret] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const response = await setupTwoFactor();
      setSecret(response.secret);
      setQrCodeUrl(response.otpauthUrl);
      setStep('setup');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при настройке 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token) {
      toast.error('Введите код из приложения');
      return;
    }

    setIsLoading(true);
    try {
      await verifyTwoFactor(token);
      setStep('completed');
      toast.success('Двухфакторная аутентификация включена');
      onComplete?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Неверный код');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'init') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Двухфакторная аутентификация
        </h2>
        
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Защитите свой аккаунт с помощью двухфакторной аутентификации
          </p>
          
          <button
            onClick={handleSetup}
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Загрузка...' : 'Настроить 2FA'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Настройка 2FA
        </h2>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Отсканируйте QR-код с помощью приложения Google Authenticator или Authy
          </p>
          
          <div className="flex justify-center mb-4">
            {qrCodeUrl && (
              <QRCode 
                value={qrCodeUrl} 
                size={200}
                level="H"
                includeMargin={true}
              />
            )}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Или вручную введите код: <br />
            <span className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
              {secret}
            </span>
          </p>
        </div>
        
        <button
          onClick={() => setStep('verify')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Я отсканировал код
        </button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Подтверждение 2FA
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Введите 6-значный код из приложения
        </p>
        
        <div className="mb-6">
          <label htmlFor="token" className="block text-gray-700 dark:text-gray-300 mb-2">
            Код из приложения
          </label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-xl tracking-widest"
            placeholder="000000"
            required
          />
        </div>
        
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Проверка...' : 'Подтвердить'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        2FA включена
      </h2>
      
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400">
          Двухфакторная аутентификация успешно настроена
        </p>
      </div>
      
      <button
        onClick={() => setStep('init')}
        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Настроить заново
      </button>
    </div>
  );
};

export default TwoFactorSetup;