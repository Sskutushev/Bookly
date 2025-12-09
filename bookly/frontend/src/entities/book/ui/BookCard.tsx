import React from 'react';
import { motion } from 'framer-motion';

// Types
import { Book } from '../model/types';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-card shadow overflow-hidden relative group"
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Price Badge */}
        {book.price > 0 ? (
          <div className="absolute top-2 right-2 bg-accent-light dark:bg-accent-dark text-text-primary-dark px-2 py-1 rounded-element text-xs font-bold">
            {book.price}₽
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-secondary-light dark:bg-secondary-dark text-white px-2 py-1 rounded-element text-xs font-bold">
            Бесплатно
          </div>
        )}
        
        {/* Favorite Button */}
        <button className="absolute top-2 left-2 bg-white/80 dark:bg-gray-700/80 p-1.5 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
          {book.title}
        </h3>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">
          {book.author}
        </p>
      </div>
    </motion.div>
  );
};

export default BookCard;