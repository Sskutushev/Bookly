import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Lib
import { set as setStorage, get as getStorage } from '../../shared/lib/telegram-storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scale: number;
  setScale: (scale: number) => void;
  theme: 'light' | 'dark' | 'sepia';
  setTheme: (theme: 'light' | 'dark' | 'sepia') => void;
  fontFamily: 'serif' | 'sans' | 'mono';
  setFontFamily: (fontFamily: 'serif' | 'sans' | 'mono') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  scale,
  setScale,
  theme,
  setTheme,
  fontFamily,
  setFontFamily,
}) => {
  const [tempScale, setTempScale] = useState(scale);
  const [tempTheme, setTempTheme] = useState(theme);
  const [tempFontFamily, setTempFontFamily] = useState(fontFamily);

  useEffect(() => {
    setTempScale(scale);
    setTempTheme(theme);
    setTempFontFamily(fontFamily);
  }, [scale, theme, fontFamily]);

  const handleSave = async () => {
    setScale(tempScale);
    setTheme(tempTheme);
    setFontFamily(tempFontFamily);
    
    // Save settings to Telegram CloudStorage
    try {
      await setStorage('readerSettings', JSON.stringify({
        scale: tempScale,
        theme: tempTheme,
        fontFamily: tempFontFamily,
      }));
    } catch (error) {
      console.error('Failed to save settings to Telegram CloudStorage:', error);
    }
    
    onClose();
  };

  const handleCancel = () => {
    setTempScale(scale);
    setTempTheme(theme);
    setTempFontFamily(fontFamily);
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
                  Настройки чтения
                </Dialog.Title>

                <div className="mt-2 space-y-4">
                  {/* Scale setting */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                      Размер (масштаб): {Math.round(tempScale * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={tempScale}
                      onChange={(e) => setTempScale(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Theme setting */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Тема оформления
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['light', 'dark', 'sepia'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`py-2 px-3 rounded-button text-sm ${
                            tempTheme === t
                              ? 'bg-primary-light dark:bg-primary-dark text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark'
                          }`}
                          onClick={() => setTempTheme(t)}
                        >
                          {t === 'light' && 'Светлая'}
                          {t === 'dark' && 'Темная'}
                          {t === 'sepia' && 'Сепия'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font family setting */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Шрифт
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['serif', 'sans', 'mono'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`py-2 px-3 rounded-button text-sm ${
                            tempFontFamily === f
                              ? 'bg-primary-light dark:bg-primary-dark text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark'
                          }`}
                          onClick={() => setTempFontFamily(f)}
                          style={{ 
                            fontFamily: f === 'serif' ? 'Georgia, serif' : 
                                       f === 'mono' ? 'Monaco, monospace' : 'Arial, sans-serif'
                          }}
                        >
                          {f === 'serif' && 'С засечками'}
                          {f === 'sans' && 'Без засечек'}
                          {f === 'mono' && 'Моноширинный'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark bg-gray-200 dark:bg-gray-700 rounded-button hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={handleCancel}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-button hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                    onClick={handleSave}
                  >
                    Сохранить
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

export default SettingsModal;