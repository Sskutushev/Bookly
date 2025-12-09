import React from 'react';
import { useAuthStore } from '@/features/auth/model/auth-store';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 backdrop-blur-lg bg-bg-light/80 dark:bg-bg-dark/80 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-light dark:text-primary-dark">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
          <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Bookly
          </span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 items-center relative">
          <input
            type="text"
            placeholder="Найти книгу..."
            className="w-full px-10 py-2 rounded-button bg-white dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 text-gray-400">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        {/* Auth Button / User Avatar */}
        <div>
          {isAuthenticated && user ? (
            <div className="w-10 h-10 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center">
              <span className="text-lg font-bold text-primary-light dark:text-primary-dark">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <button className="px-4 py-2 rounded-button font-semibold text-text-primary-light dark:text-text-primary-dark bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
