import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Components
import BookCard from '@/entities/book/ui/BookCard';
import BookModal from '@/widgets/BookModal/BookModal';

// API
import { getBooks, getGenres } from '@/entities/book/api/book-api';

// Types
import { Book } from '@/entities/book/model/types';

const HomePage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

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

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
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