import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Components
import BookCard from '@/entities/book/ui/BookCard';
import BookModal from '@/widgets/BookModal/BookModal';

// API
import { getMyBooks, deleteBookFromLibrary } from '@/features/book-reader/api/reader-api';
import { addToFavorites, removeFromFavorites } from '@/entities/book/api/book-api';

// Types
import { Book } from '@/entities/book/model/types';

const MyBooksPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'reading' | 'finished' | 'purchased'>('all');
  const queryClient = useQueryClient();

  // Fetch user's books
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['my-books', activeTab],
    queryFn: getMyBooks,
  });

  const deleteBookMutation = useMutation({
    mutationFn: (bookId: string) => deleteBookFromLibrary(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      toast.success('Книга удалена из библиотеки');
    },
    onError: () => {
      toast.error('Ошибка при удалении книги');
    }
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
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
      toast.success(variables.isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное');
    },
    onError: () => {
      toast.error('Ошибка при изменении избранного');
    }
  });

  // Filter books based on active tab
  const filteredBooks = books.filter(book => {
    const progress = book.progress || 0;
    if (activeTab === 'all') return true;
    if (activeTab === 'reading') return progress > 0 && progress < 100;
    if (activeTab === 'finished') return progress === 100;
    if (activeTab === 'purchased') return book.isPurchased;
    return true;
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

  const handleDeleteFromLibrary = (bookId: string) => {
    deleteBookMutation.mutate(bookId);
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 backdrop-blur-md bg-white/80 dark:bg-bg-dark/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-light dark:text-primary-dark">
            📚 Мои книги
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 pt-16 pb-4">
        <div className="flex overflow-x-auto space-x-3">
          {(['all', 'reading', 'finished', 'purchased'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-button whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary-light dark:bg-primary-dark text-white'
                  : 'bg-white dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' && 'Все'}
              {tab === 'reading' && 'Читаю'}
              {tab === 'finished' && 'Прочитано'}
              {tab === 'purchased' && 'Куплено'}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-card shadow p-3 animate-pulse"
              >
                <div className="bg-gray-200 dark:bg-gray-700 rounded mb-2 aspect-[3/4] max-w-[120px] relative">
                  <div className="absolute bottom-1 left-1 right-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full">
                    <div
                      className="h-full bg-primary-light dark:bg-primary-dark rounded-full"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleBookClick(book)}
                className="flex justify-center" // Center align the cards
              >
                <BookCard
                  book={book}
                  onAddToFavorite={handleAddToFavorite}
                  onRemoveFromFavorite={handleRemoveFromFavorite}
                  onDeleteFromLibrary={handleDeleteFromLibrary}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
              Ваша библиотека пуста
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
              Купите или начните читать книги
            </p>
            <button
              className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-button"
              onClick={() => window.location.href = '/'}
            >
              Найти книги
            </button>
          </div>
        )}
      </div>

      {/* Book Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={handleCloseModal}
          onBookAdded={() => {}}
        />
      )}
    </div>
  );
};

export default MyBooksPage;