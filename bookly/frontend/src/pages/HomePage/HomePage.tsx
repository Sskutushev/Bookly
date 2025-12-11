import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Components
import BookCard from '@/entities/book/ui/BookCard';
import BookModal from '@/widgets/BookModal/BookModal';

// API
import { getBooks, getGenres, addToFavorites, removeFromFavorites } from '@/entities/book/api/book-api';
import { addBookToMyBooks } from '@/features/book-reader/api/reader-api';

// Types
import { Book } from '@/entities/book/model/types';

const HomePage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch genres
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  // Fetch books with filters
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', selectedGenre],
    queryFn: () => getBooks({
      genre: selectedGenre !== 'all' ? selectedGenre : undefined,
    }),
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ bookId, isFavorite }: { bookId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        return removeFromFavorites(bookId);
      } else {
        return addToFavorites(bookId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
      toast.success(variables.isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное');
    },
    onError: () => {
      toast.error('Ошибка при изменении избранного');
    }
  });

  const addBookToMyBooksMutation = useMutation({
    mutationFn: (bookId: string) => addBookToMyBooks(bookId),
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      queryClient.invalidateQueries({ queryKey: ['reading-progress', bookId] });
      toast.success('Книга добавлена в библиотеку!');
      navigate(`/reader/${bookId}`);
    },
    onError: () => {
      toast.error('Ошибка при добавлении книги в библиотеку');
    },
  });

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
  };

  const handleAddToFavorite = (bookId: string) => {
    favoriteMutation.mutate({ bookId, isFavorite: false });
  };

  const handleRemoveFromFavorite = (bookId: string) => {
    favoriteMutation.mutate({ bookId, isFavorite: true });
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark pb-20">
      {/* Genres Filter */}
      <div className="container mx-auto px-4 pb-4 overflow-x-auto">
        <div className="flex space-x-3">
          <button
            className={`px-4 py-2 rounded-button whitespace-nowrap ${
              selectedGenre === 'all'
                ? 'bg-primary-light text-white dark:bg-primary-dark'
                : 'bg-white dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark'
            }`}
            onClick={() => setSelectedGenre('all')}
          >
            Все
          </button>

          {genres.map((genre) => (
            <button
              key={genre.id}
              className={`px-4 py-2 rounded-button whitespace-nowrap ${
                selectedGenre === genre.name
                  ? 'bg-primary-light text-white dark:bg-primary-dark'
                  : 'bg-white dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark'
              }`}
              onClick={() => setSelectedGenre(genre.name)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-card shadow p-4 animate-pulse"
              >
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleBookClick(book)}
              >
                <BookCard
                  book={book}
                  onAddToFavorite={handleAddToFavorite}
                  onRemoveFromFavorite={handleRemoveFromFavorite}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Book Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={handleCloseModal}
          onBookAdded={(bookId) => addBookToMyBooksMutation.mutate(bookId)}
        />
      )}
    </div>
  );
};

export default HomePage;