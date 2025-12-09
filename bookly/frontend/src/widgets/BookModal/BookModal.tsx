import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Components
import PaymentModal from '../../features/payment/ui/PaymentModal';

// API
import { addToFavorites, removeFromFavorites } from '../../entities/book/api/book-api';

// Types
import { Book } from '../../entities/book/model/types';

interface BookModalProps {
  book: Book;
  onClose: () => void;
  onBookAdded: () => void;
}

const BookModal: React.FC<BookModalProps> = ({ book, onClose, onBookAdded }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (book.isFavorite) {
        await removeFromFavorites(book.id);
        return false;
      } else {
        await addToFavorites(book.id);
        return true;
      }
    },
    onSuccess: (isFavorite) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', book.id] });
      toast.success(isFavorite ? 'Добавлено в избранное!' : 'Удалено из избранного');
    },
    onError: () => {
      toast.error('Ошибка при изменении избранного');
    }
  });

  const handleReadClick = () => {
    if (book.isFree) {
      // Add to user's books and navigate to reader
      onBookAdded();
      onClose();
    } else if (!book.isPurchased) {
      // Open payment modal
      setIsPaymentModalOpen(true);
    } else {
      // Navigate to reader
      onBookAdded();
      onClose();
    }
  };

  return (
    <>
      <Transition appear show={!!book} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-start">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-text-primary-light dark:text-text-primary-dark"
                    >
                      {book.title}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-40 h-56 object-cover rounded-card"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                        {book.author}
                      </h4>
                      
                      <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {book.description.length > 100 
                          ? `${book.description.substring(0, 100)}...` 
                          : book.description}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {book.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="px-2 py-1 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark text-xs rounded-element"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          className={`flex-1 px-4 py-2 rounded-button ${
                            book.isPurchased 
                              ? 'bg-green-500 text-white' 
                              : 'bg-primary-light dark:bg-primary-dark text-white'
                          }`}
                          onClick={handleReadClick}
                        >
                          {book.isFree 
                            ? 'Читать' 
                            : book.isPurchased 
                              ? 'Читать' 
                              : 'Купить'}
                        </button>
                        
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-button ${
                            book.isFavorite 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark'
                          }`}
                          onClick={() => favoriteMutation.mutate()}
                          disabled={favoriteMutation.isPending}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill={book.isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal 
          book={book} 
          onClose={() => setIsPaymentModalOpen(false)} 
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            onBookAdded();
            onClose();
          }} 
        />
      )}
    </>
  );
};

export default BookModal;