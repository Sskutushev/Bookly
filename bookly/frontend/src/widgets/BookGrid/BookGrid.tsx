// bookly/frontend/src/widgets/BookGrid/BookGrid.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Book, BookCard } from '../../entities/book/ui/BookCard/BookCard';
import { useBookModal } from '../BookModal/useBookModal';

interface BookGridProps {
  books: Book[];
  onFavoriteClick: (bookId: string, isFavorite?: boolean) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const BookGrid: React.FC<BookGridProps> = ({ books, onFavoriteClick }) => {
  const { openModal } = useBookModal();

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No books found.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {books.map((book) => (
        <motion.div key={book.id} variants={itemVariants}>
          <BookCard 
            book={book} 
            onClick={() => openModal(book.id)} 
            onFavoriteClick={() => onFavoriteClick(book.id, book.isFavorite)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BookGrid;