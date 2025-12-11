// frontend/src/features/qr-scanner/QRScanner.tsx

import React from 'react';
import { useQRScanner } from './use-qr-scanner';
import toast from 'react-hot-toast';

interface QRScannerProps {
  onScan: (code: string) => void;
  buttonText?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, buttonText = 'Сканировать QR-код' }) => {
  const { scan } = useQRScanner();

  const handleScan = async () => {
    try {
      const code = await scan();
      if (code) {
        onScan(code);
        toast.success('QR-код отсканирован!');
      }
    } catch (error) {
      toast.error('Ошибка сканирования QR-кода');
      console.error('QR Scan error:', error);
    }
  };

  return (
    <button
      onClick={handleScan}
      className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-button font-medium"
    >
      {buttonText}
    </button>
  );
};

export default QRScanner;