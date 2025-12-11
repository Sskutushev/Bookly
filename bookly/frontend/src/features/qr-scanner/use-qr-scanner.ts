// frontend/src/features/qr-scanner/use-qr-scanner.ts

import { tg } from '@/shared/lib/telegram-app';

export const useQRScanner = () => {
  const scan = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!tg) {
        console.error('Telegram Web App is not available');
        resolve(null);
        return;
      }

      tg.showScanQrPopup(
        {
          text: 'Отсканируйте QR-код промокода',
        },
        (text) => {
          // Return true to close the scanner, false to continue scanning
          if (text) {
            tg.closeScanQrPopup();
            resolve(text);
            return true;
          }
          return false;
        }
      );
    });
  };

  return { scan };
};