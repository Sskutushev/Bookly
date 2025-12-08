import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useBookModalStore } from './use-book-modal-store';
import { useBook } from '../../entities/book/api/use-book';
import { useAuthStore } from '../../entities/user/model/use-auth-store';
import { haptic } from '../../shared/lib/haptic';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../../features/payment/ui/PaymentModal';

const BookModal: React.FC = () => {
  const { isOpen, bookId, closeModal } = useBookModalStore();
  const { data: book, isLoading, error } = useBook(bookId!);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleClose = () => {
    haptic.light();
    closeModal();
  };

  const handleReadFragment = () => {
    haptic.medium();
    if (book) {
      navigate(`/reader/${book.id}?fragment=true`);
      closeModal();
    }
  };

  const handleRead = () => {
    haptic.medium();
    if (book) {
      // If book is free, add to library and navigate to reader
      if (book.isFree) {
        navigate(`/reader/${book.id}`);
        closeModal();
      }
      // If user has purchased the book, navigate to reader
      else if (book.isPurchased) {
        navigate(`/reader/${book.id}`);
        closeModal();
      }
      // If book is paid and not purchased, show payment modal
      else {
        setShowPaymentModal(true);
      }
    }
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                <Dialog.Panel className="w-full max-w-lg md:max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#1A1A2E] p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center">
                    <span>Book Details</span>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      &times;
                    </button>
                  </Dialog.Title>

                  <div className="mt-4">
                    {isLoading ? (
                      <div>Loading book details...</div>
                    ) : error ? (
                      <div className="text-red-500">Error loading book: {error.message}</div>
                    ) : book ? (
                      <div className="md:flex md:space-x-6">
                        <div className="md:w-1/3 flex-shrink-0">
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="rounded-xl shadow-lg w-full aspect-[2/3] object-cover"
                          />
                        </div>
                        <div className="mt-4 md:mt-0 md:w-2/3">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{book.title}</h2>
                          <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">{book.author}</p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {book.genres?.map((genre, index: number) => (
                              <span
                                key={genre.id || index}
                                className="px-3 py-1 text-sm rounded-full bg-[#F8F9FE] dark:bg-[#0F0F1E] text-[#1A1A2E] dark:text-white border border-[#8B7FF5] dark:border-[#9B8AFF]"
                              >
                                {genre.name}
                              </span>
                            ))}
                          </div>

                          <p className="mt-4 text-gray-700 dark:text-gray-300">
                            {book.description}
                          </p>

                          <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                            <button
                              className="w-full px-4 py-2 rounded-xl bg-[#FF9B9B] dark:bg-[#FF6B9D] text-white font-semibold hover:opacity-90 transition-opacity"
                              onClick={handleReadFragment}
                            >
                              Read Fragment
                            </button>
                            <button
                              className={`w-full px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity ${
                                book.isPurchased
                                  ? 'bg-[#8B7FF5] dark:bg-[#9B8AFF] text-white'
                                  : book.isFree
                                    ? 'bg-[#FFE45E] dark:bg-[#FFD93D] text-[#1A1A2E] dark:text-[#0F0F1E]'
                                    : 'bg-[#8B7FF5] dark:bg-[#9B8AFF] text-white'
                              }`}
                              onClick={handleRead}
                            >
                              {book.isPurchased
                                ? 'Read'
                                : book.isFree
                                  ? 'Add to Library'
                                  : `Buy for ${book.price} XTR`
                              }
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {book && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bookId={book.id}
          bookTitle={book.title}
          bookAuthor={book.author}
          bookCover={book.coverUrl}
          bookPrice={book.price}
        />
      )}
    </>
  );
};

export default BookModal;
