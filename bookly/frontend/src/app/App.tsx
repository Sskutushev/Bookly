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

// Components
import TelegramBackButton from '@/widgets/TelegramBackButton/TelegramBackButton';
import TelegramSettingsButton from '@/widgets/TelegramSettingsButton/TelegramSettingsButton';

// Lib
import { initTelegramApp } from '@/shared/lib/telegram-app';

// Store
import { useAuthStore } from '@/features/auth/model/auth-store';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    // Initialize Telegram app
    const tgData = initTelegramApp();
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', tgData.colorScheme === 'dark');
    
    // Initialize auth
    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          <TelegramBackButton />
          <TelegramSettingsButton />
          <AnimatedRoutes />
          <Toaster position="bottom-center" />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;