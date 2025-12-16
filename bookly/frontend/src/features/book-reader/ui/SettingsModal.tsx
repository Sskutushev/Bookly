// frontend/src/features/book-reader/ui/SettingsModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Telegram storage for saving settings
import { telegramStorage } from '@/shared/lib/telegram-storage';

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
  const [localScale, setLocalScale] = useState(scale);
  const [localTheme, setLocalTheme] = useState(theme);
  const [localFontFamily, setLocalFontFamily] = useState(fontFamily);

  // Load settings from Telegram CloudStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedScale = await telegramStorage.get('reader_scale');
        const savedTheme = await telegramStorage.get('reader_theme');
        const savedFontFamily = await telegramStorage.get('reader_font_family');

        if (savedScale) setLocalScale(parseFloat(savedScale));
        if (savedTheme) setLocalTheme(savedTheme as 'light' | 'dark' | 'sepia');
        if (savedFontFamily) setLocalFontFamily(savedFontFamily as 'serif' | 'sans' | 'mono');
      } catch (error) {
        console.error('Error loading reader settings:', error);
      }
    };

    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const handleSave = async () => {
    setScale(localScale);
    setTheme(localTheme);
    setFontFamily(localFontFamily);

    // Save to Telegram CloudStorage
    try {
      await telegramStorage.set('reader_scale', localScale.toString());
      await telegramStorage.set('reader_theme', localTheme);
      await telegramStorage.set('reader_font_family', localFontFamily);
    } catch (error) {
      console.error('Error saving reader settings:', error);
    }

    onClose();
  };

  const handleReset = () => {
    setLocalScale(1.0);
    setLocalTheme('light');
    setLocalFontFamily('serif');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-text-primary-light dark:text-text-primary-dark mb-4"
                >
                  Настройки чтения
                </Dialog.Title>

                <div className="mt-2 space-y-4">
                  {/* Font Size */}
                  <div>
                    <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Размер шрифта
                    </h4>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setLocalScale(Math.max(0.8, localScale - 0.1))}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-button text-text-primary-light dark:text-text-primary-dark"
                      >
                        A-
                      </button>
                      <span className="text-text-primary-light dark:text-text-primary-dark">
                        {(localScale * 100).toFixed(0)}%
                      </span>
                      <button
                        onClick={() => setLocalScale(Math.min(1.5, localScale + 0.1))}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-button text-text-primary-light dark:text-text-primary-dark"
                      >
                        A+
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.5"
                      step="0.1"
                      value={localScale}
                      onChange={(e) => setLocalScale(parseFloat(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>

                  {/* Font Family */}
                  <div>
                    <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Шрифт
                    </h4>
                    <div className="flex space-x-2">
                      {(['serif', 'sans', 'mono'] as const).map((family) => (
                        <button
                          key={family}
                          className={`px-3 py-2 rounded-button text-sm ${
                            localFontFamily === family
                              ? 'bg-primary-light dark:bg-primary-dark text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark'
                          }`}
                          onClick={() => setLocalFontFamily(family)}
                        >
                          {family === 'serif' && 'Serif'}
                          {family === 'sans' && 'Sans'}
                          {family === 'mono' && 'Mono'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Тема
                    </h4>
                    <div className="flex space-x-2">
                      {(['light', 'dark', 'sepia'] as const).map((t) => (
                        <button
                          key={t}
                          className={`px-3 py-2 rounded-button text-sm ${
                            localTheme === t
                              ? t === 'light' 
                                ? 'bg-blue-500 text-white'
                                : t === 'dark' 
                                ? 'bg-gray-700 text-white'
                                : 'bg-amber-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark'
                          }`}
                          onClick={() => setLocalTheme(t)}
                        >
                          {t === 'light' && 'Светлая'}
                          {t === 'dark' && 'Темная'}
                          {t === 'sepia' && 'Сепия'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm rounded-button bg-gray-300 dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark"
                    onClick={handleReset}
                  >
                    Сбросить
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm rounded-button bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark"
                      onClick={onClose}
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm rounded-button bg-primary-light dark:bg-primary-dark text-white"
                      onClick={handleSave}
                    >
                      Сохранить
                    </button>
                  </div>
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