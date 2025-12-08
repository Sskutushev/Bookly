// bookly/frontend/src/entities/book/ui/BookCard/BookCard.tsx
import React from 'react';
import { haptic } from '../../../../shared/lib/haptic';

export interface Genre {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  price: number;
  isFree: boolean;
  isFavorite?: boolean;
  genres?: Genre[];
  pageCount?: number;
}

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onFavoriteClick: (bookId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick, onFavoriteClick }) => {
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    haptic.light();
    onFavoriteClick(book.id);
  };

  return (
    <div 
      className="group cursor-pointer rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] w-full">
        <img src={book.coverUrl} alt={book.title} className="object-cover w-full h-full rounded-t-2xl" />
        <div className="absolute top-2 right-2">
          <button 
            onClick={handleFavorite} 
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
              book.isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-red-100'
            }`}
          >
            ❤️
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <div className="px-2 py-1 text-sm font-semibold text-gray-800 bg-white/80 backdrop-blur-sm rounded-full">
            {book.isFree ? 'Бесплатно' : `${book.price}₽`}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">{book.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{book.author}</p>
        {/* Display genres if available */}
        {book.genres && book.genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {book.genres.slice(0, 2).map((genre) => (
              <span
                key={genre.id}
                className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {genre.name}
              </span>
            ))}
            {book.genres.length > 2 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                +{book.genres.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
