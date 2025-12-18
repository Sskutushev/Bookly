import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLongPress } from '@/shared/lib/use-long-press';
import ContextMenu from '@/shared/ui/ContextMenu';

// Types
import { Book } from '../model/types';

interface BookCardProps {
  book: Book;
  onAddToFavorite?: (bookId: string) => void;
  onRemoveFromFavorite?: (bookId: string) => void;
  onDeleteFromLibrary?: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onAddToFavorite,
  onRemoveFromFavorite,
  onDeleteFromLibrary
}) => {
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0
  });

  const cardRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setContextMenu({
      isOpen: true,
      x: clientX,
      y: clientY
    });
  };

  const longPressEvent = useLongPress(handleLongPress, {
    threshold: 500,
    onCancel: () => {},
    onFinish: () => {}
  });

  const contextMenuOptions = [
    {
      label: book.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное',
      action: () => {
        if (book.isFavorite) {
          onRemoveFromFavorite?.(book.id);
        } else {
          onAddToFavorite?.(book.id);
        }
      },
      icon: book.isFavorite ? '❤️' : '🤍'
    },
    ...(onDeleteFromLibrary ? [{
      label: 'Удалить из библиотеки',
      action: () => {
        onDeleteFromLibrary(book.id);
      },
      icon: '🗑️'
    }] : [])
  ];

  return (
    <div ref={cardRef} className="flex-shrink-0">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-card shadow overflow-hidden relative group w-full"
        whileHover={{ y: -5, scale: 1.03 }}
        transition={{ duration: 0.2 }}
        {...longPressEvent}
        onContextMenu={handleContextMenu}
      >
        <div className="relative aspect-[3/4] max-w-[120px]"> {/* Fixed aspect ratio and max-width for smaller mobile size */}
          <img
            src={import.meta.env.VITE_API_BASE_URL + book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />

          {/* Price Badge */}
          {book.price > 0 ? (
            <div className="absolute top-1 right-1 bg-accent-light dark:bg-accent-dark text-text-primary-dark px-1.5 py-0.5 rounded-element text-xs font-bold">
              {book.price}₽
            </div>
          ) : (
            <div className="absolute top-1 right-1 bg-secondary-light dark:bg-secondary-dark text-white px-1.5 py-0.5 rounded-element text-xs font-bold">
              Бесплатно
            </div>
          )}

          {/* Favorite Button */}
          <button
            className="absolute top-1 left-1 bg-white/80 dark:bg-gray-700/80 p-1 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              if (book.isFavorite) {
                onRemoveFromFavorite?.(book.id);
              } else {
                onAddToFavorite?.(book.id);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${book.isFavorite ? 'text-red-500' : 'text-gray-500'}`}
              fill={book.isFavorite ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke={book.isFavorite ? "none" : "currentColor"}
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

        <div className="p-2">
          <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate text-sm">
            {book.title}
          </h3>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
            {book.author}
          </p>
        </div>
      </motion.div>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ isOpen: false, x: 0, y: 0 })}
        options={contextMenuOptions}
        x={contextMenu.x}
        y={contextMenu.y}
      />
    </div>
  );
};

export default BookCard;