import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
    if (tgData?.colorScheme) {
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
        <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark">
          <TelegramBackButton />
          <TelegramSettingsButton />
          
          <Header />

          {/* Main content area with padding top and bottom for fixed header/nav */}
          <main className="flex-grow pt-16 pb-16">
            <AnimatedRoutes />
          </main>

          <BottomNav />
          
          <Toaster position="bottom-center" />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;