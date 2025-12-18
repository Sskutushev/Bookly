import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from '@/pages/HomePage/HomePage';
import FavoritesPage from '@/pages/FavoritesPage/FavoritesPage';
import MyBooksPage from '@/pages/MyBooksPage/MyBooksPage';
import ProfilePage from '@/pages/ProfilePage/ProfilePage';
import Reader from '@/features/book-reader/ui/Reader';
import AuthPage from '@/pages/AuthPage/AuthPage';
import HelpPage from '@/pages/HelpPage/HelpPage';

// Auth Components
import PasswordResetForm from '@/features/auth/ui/PasswordResetForm';

// Components
import Header from '@/widgets/Header/Header';
import BottomNav from '@/widgets/BottomNav/BottomNav';
import TelegramBackButton from '@/widgets/TelegramBackButton/TelegramBackButton';
import TelegramSettingsButton from '@/widgets/TelegramSettingsButton/TelegramSettingsButton';

// Lib
import { initTelegramApp } from '@/shared/lib/telegram-app';

// Store
import { useAuthStore } from '@/features/auth/model/auth-store';
import { useThemeStore } from '@/features/theme/useThemeStore';


// UI
import AnimatedPage from '@/shared/ui/AnimatedPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Desktop Sidebar Navigation Component
const DesktopSidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Главная',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      path: '/favorites',
      label: 'Избранное',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      )
    },
    {
      path: '/my-books',
      label: 'Мои книги',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'Профиль',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
  ];

  return (
    <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark mb-6">
          Bookly
        </h2>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-light dark:bg-primary-dark text-white'
                      : 'text-text-primary-light dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

// Wrapper component for page transitions
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <AnimatedPage>
            <HomePage />
          </AnimatedPage>
        } />
        <Route path="/favorites" element={
          <AnimatedPage>
            <FavoritesPage />
          </AnimatedPage>
        } />
        <Route path="/my-books" element={
          <AnimatedPage>
            <MyBooksPage />
          </AnimatedPage>
        } />
        <Route path="/profile" element={
          <AnimatedPage>
            <ProfilePage />
          </AnimatedPage>
        } />
        <Route path="/reader/:bookId" element={
          <AnimatedPage>
            <Reader />
          </AnimatedPage>
        } />
        <Route path="/auth" element={
          <AnimatedPage>
            <AuthPage />
          </AnimatedPage>
        } />
        <Route path="/help" element={
          <AnimatedPage>
            <HelpPage />
          </AnimatedPage>
        } />
        <Route path="/forgot-password" element={
          <AnimatedPage>
            <PasswordResetForm variant="forgot" />
          </AnimatedPage>
        } />
        <Route path="/reset-password/:token" element={
          <AnimatedPage>
            <PasswordResetForm variant="reset" />
          </AnimatedPage>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const { initAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  // Effect to initialize the app and sync themes
  useEffect(() => {
    // Ensure a guest ID exists for anonymous users
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', crypto.randomUUID());
    }

    initAuth();
    const tgData = initTelegramApp();
    // Only set the theme from Telegram if user hasn't manually changed it
    // Check if theme was already set by user hasn't manually changed it
    if (tgData?.colorScheme && !localStorage.getItem('theme-preference-set')) {
      setTheme(tgData.colorScheme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to apply the theme class to the document root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* App container with flex layout to structure header, main, and footer */}
        <div className="flex flex-col md:flex-row min-h-screen bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark">
          <TelegramBackButton />
          <TelegramSettingsButton />

          {/* Desktop sidebar - hidden on mobile */}
          <DesktopSidebar />

          <div className="flex flex-col flex-1">
            <Header />

            {/* Main content area with padding top and bottom for fixed header/nav */}
            <main className="flex-grow pt-16 pb-16 md:pt-16 md:pb-0 md:ml-0">
              <AnimatedRoutes />
            </main>

            {/* Mobile navigation - hidden on desktop */}
            <div className="md:hidden">
              <BottomNav />
            </div>
          </div>

          <Toaster position="bottom-center" />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;