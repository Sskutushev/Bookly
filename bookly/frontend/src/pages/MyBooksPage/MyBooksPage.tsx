import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// Components
import BookCard from '../entities/book/ui/BookCard';
import BookModal from '../widgets/BookModal/BookModal';

// API
import { getMyBooks } from '../features/book-reader/api/reader-api';

// Types
import { Book } from '../entities/book/model/types';

const MyBooksPage: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'reading' | 'finished' | 'purchased'>('all');

  // Fetch user's books
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['my-books', activeTab],
    queryFn: getMyBooks,
  });

  // Filter books based on active tab
  const filteredBooks = books.filter(book => {
    if (activeTab === 'all') return true;
    if (activeTab === 'reading') return book.progress > 0 && book.progress < 100;
    if (activeTab === 'finished') return book.progress === 100;
    if (activeTab === 'purchased') return book.isPurchased;
    return true;
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-card shadow p-4 animate-pulse"
              >
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded mb-3 relative">
                  <div className="absolute bottom-2 left-2 right-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full">
                    <div 
                      className="h-full bg-primary-light dark:bg-primary-dark rounded-full" 
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => handleBookClick(book)}
              >
                <div className="bg-white dark:bg-gray-800 rounded-card shadow overflow-hidden relative group">
                  <div className="relative">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Progress indicator */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="h-2 bg-white/80 dark:bg-gray-700/80 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-light dark:bg-primary-dark" 
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-white mt-1 text-center">
                        {book.progress}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                      {book.title}
                    </h3>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">
                      {book.author}
                    </p>
                  </div>
                </div>
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