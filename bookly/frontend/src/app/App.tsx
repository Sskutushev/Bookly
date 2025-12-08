import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initTelegramApp } from '../shared/lib/telegram-app';
import { TelegramProvider } from '../shared/lib/telegram-context';
import HomePage from '../pages/HomePage/HomePage';
import FavoritesPage from '../pages/FavoritesPage/FavoritesPage';
import MyBooksPage from '../pages/MyBooksPage/MyBooksPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import Reader from '../features/book-reader/ui/Reader';
import { TelegramBackButton } from '../widgets/TelegramBackButton';
import { TelegramSettingsButton } from '../widgets/TelegramSettingsButton';

import { useAuth } from '../features/auth/model/use-auth';
import { useAuthStore } from '../entities/user/model/use-auth-store';
import BookModal from '../widgets/BookModal/BookModal';

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading } = useAuthStore();

  // Trigger Telegram authentication flow
  useAuth();

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramApp();
  }, []);

  useEffect(() => {
    // Check if BackButton is supported
    if (!window.Telegram?.WebApp?.BackButton) {
      console.warn('Telegram BackButton is not supported in this version');
      return;
    }

    // Show/hide back button based on route
    if (location.pathname === '/') {
      window.Telegram.WebApp.BackButton.hide();
    } else {
      window.Telegram.WebApp.BackButton.show();
    }

    // Set up back button handler
    const handleBackButton = () => {
      navigate(-1);
    };

    window.Telegram.WebApp.BackButton.onClick(handleBackButton);

    // Cleanup
    return () => {
      window.Telegram.WebApp.BackButton.offClick(handleBackButton);
    };
  }, [location, navigate]);

  useEffect(() => {
    // Check if SettingsButton is supported
    if (!window.Telegram?.WebApp?.SettingsButton) {
      console.warn('Telegram SettingsButton is not supported in this version');
      return;
    }

    // Set up settings button
    const handleSettingsButton = () => {
      navigate('/profile');
    };

    window.Telegram.WebApp.SettingsButton.onClick(handleSettingsButton);

    // Cleanup
    return () => {
      window.Telegram.WebApp.SettingsButton.offClick(handleSettingsButton);
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <TelegramBackButton />
      <TelegramSettingsButton />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/my-books" element={<MyBooksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reader/:bookId" element={<Reader />} />
      </Routes>
    </div>
  );
};



const App = () => {
  return (
    <TelegramProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
          <BookModal />
        </Router>
      </QueryClientProvider>
    </TelegramProvider>
  );
};

export default App;