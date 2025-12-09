import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// Components
import BookCard from '@/entities/book/ui/BookCard';
import BookModal from '@/widgets/BookModal/BookModal';

// API
import { getBooks } from '@/entities/book/api/book-api';

// Types
import { Book } from '@/entities/book/model/types';

const FavoritesPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('date');

  // Fetch favorite books
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['favorites', selectedGenre, sortOrder],
    queryFn: () => getBooks({ 
      genre: selectedGenre !== 'all' ? selectedGenre : undefined,
      // In a real app, we would have a specific endpoint for favorites
      // For now, we're just filtering all books
    }),
  });

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 backdrop-blur-md bg-white/80 dark:bg-bg-dark/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-light dark:text-primary-dark">
            ⭐ Избранное
          </h1>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 pt-16 pb-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2 rounded-button bg-white dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="all">Все жанры</option>
              <option value="detective">Детектив</option>
              <option value="romance">Романтика</option>
              <option value="fantasy">Фантастика</option>
            </select>
            
            <select
              className="px-3 py-2 rounded-button bg-white dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="date">По дате добавления</option>
              <option value="title">По названию</option>
              <option value="author">По автору</option>
            </select>
          </div>
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
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleBookClick(book)}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
              Здесь пока пусто
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
              Добавляйте книги в избранное
            </p>
            <button 
              className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-button"
              onClick={() => window.history.back()}
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

export default FavoritesPage;