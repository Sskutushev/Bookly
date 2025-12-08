import React, { useState, useEffect, useRef } from 'react';
import { useBooks } from '../../entities/book/api/use-books';
import BookGrid from '../../widgets/BookGrid/BookGrid';
import { useDebounce } from '../../shared/lib/use-debounce';
import { useFavoriteMutation } from '../../features/favorites/api/use-favorites';
import { haptic } from '../../shared/lib/haptic';
import { useAuthStore } from '../../entities/user/model/use-auth-store';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchQuery, 500);
  const favoriteMutation = useFavoriteMutation();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useBooks(genre, debouncedSearch);

  const observer = useRef<IntersectionObserver>();
  const lastBookElementRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );
  
  const allBooks = data?.pages.flatMap((page) => page.books) ?? [];

  const handleFavoriteClick = (bookId: string, isFavorite?: boolean) => {
    haptic.light();
    favoriteMutation.mutate({ bookId, isFavorite: isFavorite ?? false });
  };

  return (
    <div className="p-4">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl mb-4">
        {/* Main Header with logo and login */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-[#8B7FF5] dark:text-[#9B8AFF] flex items-center">
            📚 Bookly
          </div>
          <div>
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 hidden md:inline">{user.name}</span>
              </div>
            ) : (
              <button
                className="flex items-center space-x-2 bg-[#8B7FF5] dark:bg-[#9B8AFF] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                onClick={() => {
                  haptic.selection();
                  // Initiate Telegram WebApp authentication
                  const tg = (window as any).Telegram?.WebApp;
                  if (tg) {
                    // In a real app, this would trigger Telegram auth
                    console.log("Opening Telegram auth...");
                    // In real scenario, we would redirect to bot or use tg WebApp methods
                  } else {
                    // Fallback for browser environment
                    console.log("Redirecting to login...");
                  }
                }}
              >
                <span>👤 Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search for books or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {/* Genre Filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {['Все', 'Детектив', 'Романтика', 'Фантастика', 'Фэнтези', 'Драма'].map((genreOption) => (
            <button
              key={genreOption}
              onClick={() => setGenre(genreOption === 'Все' ? undefined : genreOption)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 min-w-[72px] text-center ${
                genreOption === 'Все' && !genre
                  ? 'bg-[#8B7FF5] dark:bg-[#9B8AFF] text-white'
                  : genreOption === 'Все'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    : genreOption === genre
                      ? 'bg-[#8B7FF5] dark:bg-[#9B8AFF] text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {genreOption}
            </button>
          ))}
        </div>
      </header>
      
      {isFetching && !isFetchingNextPage ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error.message}</div>
      ) : (
        <>
          <BookGrid books={allBooks} onFavoriteClick={handleFavoriteClick} />
          <div ref={lastBookElementRef} />
        </>
      )}
      
      {isFetchingNextPage && (
        <div className="text-center py-4">Loading more...</div>
      )}

      {!hasNextPage && !isFetching && (
        <div className="text-center py-4 text-gray-500">
          You've reached the end.
        </div>
      )}

      {/* Bottom Navigation for Mobile - Adding spacing to prevent overlap */}
      <div className="pb-20"></div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4">
          <button
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#F8F9FE] dark:bg-[#0F0F1E] text-[#8B7FF5] dark:text-[#9B8AFF] min-h-[56px]"
            onClick={() => navigate('/')}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Главная</span>
          </button>
          <button
            className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-600 dark:text-gray-400 min-h-[56px]"
            onClick={() => navigate('/favorites')}
          >
            <span className="text-xl">⭐</span>
            <span className="text-xs mt-1">Избранное</span>
          </button>
          <button
            className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-600 dark:text-gray-400 min-h-[56px]"
            onClick={() => navigate('/my-books')}
          >
            <span className="text-xl">📚</span>
            <span className="text-xs mt-1">Мои книги</span>
          </button>
          <button
            className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-600 dark:text-gray-400 min-h-[56px]"
            onClick={() => navigate('/profile')}
          >
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
