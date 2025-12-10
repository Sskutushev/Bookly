import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            Настройки чтения
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
              Размер текста
            </h4>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setScale(Math.max(0.8, scale - 0.1))}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
              >
                A-
              </button>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {Math.round(scale * 100)}%
              </span>
              <button 
                onClick={() => setScale(Math.min(1.5, scale + 0.1))}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
              >
                A+
              </button>
            </div>
          </div>
          
          {/* Font Family */}
          <div>
            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
              Шрифт
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(['serif', 'sans', 'mono'] as const).map((font) => (
                <button
                  key={font}
                  type="button"
                  className={`py-2 px-3 rounded-button text-sm ${
                    fontFamily === font
                      ? 'bg-primary-light dark:bg-primary-dark text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark'
                  }`}
                  onClick={() => setFontFamily(font)}
                >
                  {font === 'serif' && 'Serif'}
                  {font === 'sans' && 'Sans'}
                  {font === 'mono' && 'Mono'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Theme */}
          <div>
            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
              Тема
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'sepia'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`py-2 px-3 rounded-button text-sm ${
                    theme === t
                      ? t === 'light' 
                        ? 'bg-gray-200 text-gray-900' 
                        : t === 'dark' 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-yellow-200 text-yellow-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark'
                  }`}
                  onClick={() => setTheme(t)}
                >
                  {t === 'light' && 'Светлая'}
                  {t === 'dark' && 'Темная'}
                  {t === 'sepia' && 'Сепия'}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-primary-light dark:bg-primary-dark text-white py-2 px-4 rounded-lg hover:opacity-90 transition duration-200"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;