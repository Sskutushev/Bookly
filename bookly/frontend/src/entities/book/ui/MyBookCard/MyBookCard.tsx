// bookly/frontend/src/entities/book/ui/MyBookCard/MyBookCard.tsx
import React from 'react';
import { Book } from '../BookCard/BookCard';

interface MyBook extends Book {
    progress: number;
    status: 'reading' | 'finished' | 'purchased';
}

interface MyBookCardProps {
  book: MyBook;
  onClick: () => void;
}

export const MyBookCard: React.FC<MyBookCardProps> = ({ book, onClick }) => {
  return (
    <div 
      className="group cursor-pointer rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] w-full">
        <img src={book.coverUrl} alt={book.title} className="object-cover w-full h-full rounded-t-2xl" />
        {book.status === 'finished' && (
             <div className="absolute top-2 left-2 px-2 py-1 text-sm font-semibold text-white bg-green-500 rounded-full">
                Finished
             </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">{book.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{book.author}</p>
        {book.status !== 'finished' && (
            <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${book.progress}%` }}></div>
                </div>
                <p className="text-xs text-right text-gray-500 mt-1">{book.progress}%</p>
            </div>
        )}
      </div>
    </div>
  );
};
