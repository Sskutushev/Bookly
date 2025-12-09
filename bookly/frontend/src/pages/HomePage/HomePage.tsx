import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Components
import BookCard from '../../entities/book/ui/BookCard';
import BookModal from '../../widgets/BookModal/BookModal';

// API
import { getBooks, getGenres } from '../../entities/book/api/book-api';

// Types
import { Book } from '../../entities/book/model/types';

const HomePage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch genres
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  // Fetch books with filters
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', selectedGenre, searchQuery],
    queryFn: () => getBooks({
      genre: selectedGenre !== 'all' ? selectedGenre : undefined,
      search: searchQuery,
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
          <div className="text-2xl font-bold text-primary-light dark:text-primary-dark">
            Bookly
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <input
              type="text"
              placeholder="Найти книгу..."
              className="w-full px-4 py-2 rounded-button bg-white dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-text-primary-light dark:text-text-primary-dark font-medium">
              {selectedBook?.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </header>

      {/* Genres Filter */}
      <div className="container mx-auto px-4 pt-20 pb-4 overflow-x-auto">
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
                <BookCard book={book} />
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
          onBookAdded={() => toast.success('Книга добавлена в библиотеку!')}
        />
      )}
    </div>
  );
};

export default HomePage;