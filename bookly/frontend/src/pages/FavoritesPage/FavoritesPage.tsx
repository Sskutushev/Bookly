import React from 'react';
import { useFavorites, useFavoriteMutation } from '../../features/favorites/api/use-favorites';
import BookGrid from '../../widgets/BookGrid/BookGrid';
import { haptic } from '../../shared/lib/haptic';

const FavoritesPage = () => {
  const { data: books, isLoading, error } = useFavorites();
  const favoriteMutation = useFavoriteMutation();

  const handleFavoriteClick = (bookId: string, isFavorite?: boolean) => {
    haptic.light();
    favoriteMutation.mutate({ bookId, isFavorite: isFavorite ?? false });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading your favorite books...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">⭐ Your Favorites</h1>
      {books && books.length > 0 ? (
        <BookGrid books={books} onFavoriteClick={handleFavoriteClick} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-64">
          <span className="text-6xl mb-4">📚</span>
          <h2 className="text-xl font-semibold">Your favorites list is empty</h2>
          <p className="text-gray-500">Add books to your favorites to see them here.</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;

