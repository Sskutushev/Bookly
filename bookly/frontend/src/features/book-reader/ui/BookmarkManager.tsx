// frontend/src/features/book-reader/ui/BookmarkManager.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { telegramStorage } from '@/shared/lib/telegram-storage';

interface Bookmark {
  id: string;
  bookId: string;
  title: string;
  chapter: string;
  pageNumber: number;
  date: string;
}

interface BookmarkManagerProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  currentPage: number;
  currentChapter: string;
  onGoToBookmark: (pageNumber: number) => void;
}

const BookmarkManager: React.FC<BookmarkManagerProps> = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  currentPage,
  currentChapter,
  onGoToBookmark,
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');

  // Load bookmarks from Telegram CloudStorage
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const storedBookmarks = await telegramStorage.get(`bookmarks_${bookId}`);
        if (storedBookmarks) {
          setBookmarks(JSON.parse(storedBookmarks));
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };

    if (isOpen) {
      loadBookmarks();
    }
  }, [bookId, isOpen]);

  const handleAddBookmark = useCallback(async () => {
    const newBookmark: Bookmark = {
      id: `bm_${Date.now()}`, // Simple ID generation
      bookId,
      title: newBookmarkTitle || `Закладка, стр. ${currentPage}`,
      chapter: currentChapter,
      pageNumber: currentPage,
      date: new Date().toISOString(),
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);

    try {
      await telegramStorage.set(`bookmarks_${bookId}`, JSON.stringify(updatedBookmarks));
      setNewBookmarkTitle(''); // Clear the input
      onClose(); // Close the modal after adding
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  }, [bookId, newBookmarkTitle, currentChapter, currentPage, bookmarks, onClose]);

  const handleDeleteBookmark = useCallback(async (bookmarkId: string) => {
    const updatedBookmarks = bookmarks.filter(bm => bm.id !== bookmarkId);
    setBookmarks(updatedBookmarks);

    try {
      await telegramStorage.set(`bookmarks_${bookId}`, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  }, [bookId, bookmarks]);

  // The navigation function should be passed from the parent component
  // For now, we'll make it a required prop

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-text-primary-light dark:text-text-primary-dark mb-4"
                >
                  Закладки
                </Dialog.Title>

                <div className="mt-2">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Добавить новую закладку
                    </h4>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newBookmarkTitle}
                        onChange={(e) => setNewBookmarkTitle(e.target.value)}
                        placeholder={`Закладка, стр. ${currentPage}`}
                        className="flex-1 px-3 py-2 rounded-button bg-white dark:bg-gray-600 text-text-primary-light dark:text-text-primary-dark border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-button"
                        onClick={handleAddBookmark}
                      >
                        Добавить
                      </button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Сохраненные закладки
                    </h4>
                    {bookmarks.length > 0 ? (
                      <div className="space-y-2">
                        {bookmarks.map((bookmark) => (
                          <div
                            key={bookmark.id}
                            className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-button"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                {bookmark.title}
                              </div>
                              <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                Стр. {bookmark.pageNumber} • {new Date(bookmark.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => onGoToBookmark(bookmark.pageNumber)}
                                className="text-xs px-2 py-1 bg-primary-light dark:bg-primary-dark text-white rounded-button"
                              >
                                Перейти
                              </button>
                              <button
                                onClick={() => handleDeleteBookmark(bookmark.id)}
                                className="text-xs px-2 py-1 bg-red-500 text-white rounded-button"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                        Нет сохраненных закладок
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text-primary-light dark:text-text-primary-dark rounded-button"
                    onClick={onClose}
                  >
                    Закрыть
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BookmarkManager;